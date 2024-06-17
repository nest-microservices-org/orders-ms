import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from "@nestjs/microservices"
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { PrismaClient, Order } from '@prisma/client';
import { OrderPaginationDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger("OrdersService");

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to Prisma');
  }
  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto
    })
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { status, limit, page } = orderPaginationDto
    const total = await this.order.count({
      where:{
        status
      }
    })

    return {
      data: await this.order.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where:{
          status
         }
       }),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      }
    }

  }

  async findOne(id: Order['id']) {
    const order = await this.order.findUnique({
      where: {
        id,
      },
    });

    if(!order) {
      throw new RpcException(`Order with id ${id} could not be found`)
    }

    return order
  }

  async updateOrderStatus(updateOrderStatusDto: UpdateOrderStatusDto){
    const { id, status } = updateOrderStatusDto;
    
    const order = await this.findOne(id)

    if(order.status === status) {
      return order
    }

    return {
      data: await this.order.update({
        where:{
          id
         },
        data:{
          status
         }
       })
     }
  }
}
