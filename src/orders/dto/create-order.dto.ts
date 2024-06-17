import { OrderStatus } from '@prisma/client';
import { orderStatusList } from '../enum/order.enum';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateOrderDto {

  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @IsNumber()
  @IsPositive()
  totalItems: number;

  @IsEnum(orderStatusList, {
     message: 'Invalid Status',
  })
  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING;

  @IsOptional()
  @IsBoolean()
  paid: boolean = false;
}
