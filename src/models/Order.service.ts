import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import { Member } from "../libs/types/member";
import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";
import MemberService from "./Member.service";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.memberService = new MemberService();
  }

  public async createOrder(
    member: Member,
    input: OrderItemInput[]
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount < 100 ? 5 : 0;

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
      });

      const orderId = newOrder._id;
      console.log("orderId:", orderId);
      await this.recordOrderItem(orderId, input);

      return newOrder;
    } catch (err) {
      console.log("Error, model:createOrder:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderItemInput[]
  ): Promise<void> {
    //record uchun mantiq bolsa (1)
    const promisedList = input.map(async (item: OrderItemInput) => {
      //map를 이용하는 이유: async for/while 과 사용할 수 없기 떼문에
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjectId(item.productId);
      await this.orderItemModel.create(item);
      return "INSERTED";
    });

    // record uchun mantiqni ishga tushuruvchi mantiq (2)
    const orderItemsState = await Promise.all(promisedList);
    console.log("orderItemsState:", orderItemsState);
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };

    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productData",
          },
        },
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  // public async updateOrder(
  //   member: Member,
  //   input: OrderUpdateInput
  // ): Promise<Order> {
  //   const memberId = shapeIntoMongooseObjectId(member._id);
  //   const orderId = shapeIntoMongooseObjectId(input.orderId);
  //   const orderStatus = input.orderStatus;

  //   const result = await this.orderModel
  //     .findOneAndUpdate(
  //       {
  //         memberId: memberId,
  //         _id: orderId,
  //       },
  //       { orderStatus: orderStatus },
  //       { new: true }
  //     )
  //     .exec();

  //   if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

  //   if (orderStatus === OrderStatus.PROCESS) {
  //     await this.memberService.addUserPoint(member, 1);
  //   }

  //   return result;
  // }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const orderId = shapeIntoMongooseObjectId(input.orderId);

    const order = await this.orderModel.findOne({
      memberId,
      _id: orderId,
    });

    if (!order) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    // ✅ faqat 1 marta point
    if (
      input.orderStatus === OrderStatus.FINISH &&
      order.orderStatus !== OrderStatus.FINISH &&
      !order.orderRewarded
    ) {
      const rewardPoint = Math.floor(order.orderTotal * 0.05); // 5%
      await this.memberService.addUserPoint(member, rewardPoint);
      order.orderRewarded = true;
    }

    order.orderStatus = input.orderStatus;
    await order.save();

    return order;
  }
}

export default OrderService;
