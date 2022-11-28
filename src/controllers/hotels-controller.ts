import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import hotelsService from "@/services/hotels-service";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const hotelsList = await hotelsService.searchAllHotels(req.userId);
    res.status(httpStatus.OK).send(hotelsList);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    } else if (error.name === "RequestError") {
      res.sendStatus(httpStatus.BAD_REQUEST);
    }
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getHotelsWithRooms(req: AuthenticatedRequest, res: Response) {
  try {
    const { hotelId } = req.params;
    const hotelRoomList = await hotelsService.searchHotelRooms(Number(hotelId));
    res.status(httpStatus.OK).send(hotelRoomList);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    }
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
