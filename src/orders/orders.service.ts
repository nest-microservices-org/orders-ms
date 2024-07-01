import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { PrismaClient, Order } from '@prisma/client';
import { OrderPaginationDto } from './dto';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {
    super();
  }

  private readonly logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to Prisma');
  }
  async create(createOrderDto: CreateOrderDto) {
    try {
      const ids = createOrderDto.items.map((item) => item.productId);
      const products: OrderItem[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, ids),
      );
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = products.find(
          (product) => product.id === orderItem.productId,
        ).price;
        return acc + price * orderItem.quantity;
      }, 0);

      const totalItems = createOrderDto.items.length;

      // create a transaction
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItems: {
            createMany: {
              data: createOrderDto.items.map((item) => {
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  price: products.find(
                    (product) => product.id === item.productId,
                  ).price,
                };
              }),
            },
          },
        },
        include: {
          OrderItems: {
            select: {
              price: true,
              productId: true,
              quantity: true,
            },
          },
        },
      });
      return {
        ...order,
        OrderItems: order.OrderItems.map((item) => ({
          ...item,
          name: products.find((product) => product.id === item.productId).name,
        })),
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { status, limit, page } = orderPaginationDto;
    const total = await this.order.count({
      where: {
        status,
      },
    });

    return {
      data: await this.order.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          status,
        },
      }),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: Order['id']) {
    try {
      const order = await this.order.findFirst({
        where: {
          id,
        },
        include: {
          OrderItems: {
            select: {
              price: true,
              productId: true,
              quantity: true,
            },
          },
        },
      });

      const orderProducts: OrderItem[] = await firstValueFrom(this.client.send({ cmd: "validate_products" }, order.OrderItems.map((item) => item.productId)));

      return {
        ...order,
        OrderItems: order.OrderItems.map(item => ({
          ...item,
          name: orderProducts.find(product => product.id === item.productId).name,
        }))
      }
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async updateOrderStatus(updateOrderStatusDto: UpdateOrderStatusDto) {
    const { id, status } = updateOrderStatusDto;

    return updateOrderStatusDto;
    // const order = await this.findOne(id)

    // if(order.status === status) {
    //   return order
    // }

    // return {
    //   data: await this.order.update({
    //     where:{
    //       id
    //      },
    //     data:{
    //       status
    //      }
    //    })
    //  }
  }
}
