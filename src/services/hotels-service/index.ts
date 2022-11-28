import { notFoundError, requestError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import hotelsRepository from "@/repositories/hotels-repository";

async function searchAllHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findPaidTicketByEnrollmentId(enrollment.id);
  if (ticket && ticket.TicketType.includesHotel !== true) {
    throw requestError(401, "It must be at least one paid ticket and should includes hotel");
  }

  return await hotelsRepository.findHotels();
}

async function searchHotelRooms(hotelId: number) {
  const hotel = await hotelsRepository.findHotelsWithRooms(hotelId);
  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

const hotelsService = {
  searchAllHotels,
  searchHotelRooms,
};

export default hotelsService;
