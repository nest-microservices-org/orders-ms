import { Catch, ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements WsExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const rpcError = exception.getError();

    if(typeof rpcError === 'object' && "status" in rpcError && "message" in rpcError) {
      const status = isNaN(+rpcError.status) ?  500 : +rpcError.status;
      return response.status(status).json(rpcError);
    }

    response.status(400).json({
      statusCode: 400,
      message: 'Forbidden',
      error: rpcError,
    })
  }
}