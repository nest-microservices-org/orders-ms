import { OrderItemDto } from './order-item.dto';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {

  // Version 1.0
  // @IsNumber()
  // @IsPositive()
  // totalAmount: number;

  // @IsNumber()
  // @IsPositive()
  // totalItems: number;

  // @IsEnum(orderStatusList, {
  //    message: 'Invalid Status',
  // })
  // @IsOptional()
  // status: OrderStatus = OrderStatus.PENDING;

  // @IsOptional()
  // @IsBoolean()
  // paid: boolean = false;


   // Version 2.0
   @IsArray()
   @ArrayMinSize(1)
   @ValidateNested({ each: true })
   @Type(() => OrderItemDto)
   items: OrderItemDto[];
}
