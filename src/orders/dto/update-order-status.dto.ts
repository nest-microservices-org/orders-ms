import { IsEnum, IsUUID } from "class-validator";
import { orderStatusList } from "../enum/order.enum";
import { OrderStatus } from "@prisma/client";

export class UpdateOrderStatusDto {

  @IsUUID()

  id: string;
  @IsEnum(orderStatusList, {
    message: 'Invalid Status',
  })
  status: OrderStatus;
}