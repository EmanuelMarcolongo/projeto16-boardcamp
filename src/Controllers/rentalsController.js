import dayjs from "dayjs";
import { connectionDB } from "../database/db.js";

export async function postRentalsController(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const { game } = res.locals;
  const originalPrice = game.pricePerDay * daysRented;
  const rentDate = dayjs().format("YYYY-MM-DD");

  try {
    await connectionDB.query(
      `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented",
           "returnDate", "originalPrice", "delayFee")
           VALUES ($1, $2,$3,$4, $5,$6,$7)`,
      [customerId, gameId, rentDate, daysRented, null, originalPrice, null]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.sendStatus(500);
  }
}

export async function getRentalsController(req, res) {
  const { customerId } = req.query;
  const { gameId } = req.query;

  if (customerId) {
    try {
      const rentals = await connectionDB.query(
        `SELECT rentals.*,
           customers.id , customers.name AS "customername", games.id, games.name AS "gameName", games."categoryId", categories.name AS "categoryName"
           FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON "gameId" = games.id 
           JOIN categories ON games."categoryId" = categories.id
           WHERE rentals."customerId" = $1;`,
        [customerId]
      );

      return res.send(
        rentals.rows.map((i) => ({
          id: i.id,
          customerId: i.customerId,
          gameId: i.gameId,
          rentDate: i.rentDate,
          daysRented: i.daysRented,
          returnDate: i.returnDate,
          originalPrice: i.originalPrice,
          delayFee: i.delayFee,
          customer: {
            id: i.customerId,
            name: i.customername,
          },
          game: {
            id: i.gameId,
            name: i.gameName,
            categoryId: i.categoryId,
            categoryName: i.categoryName,
          },
        }))
      );
    } catch (err) {
      return res.sendStatus(500);
    }
  }

  if (gameId) {
    try {
      const rentals = await connectionDB.query(
        `SELECT rentals.*,
           customers.id , customers.name AS "customername", games.id, games.name AS "gameName", games."categoryId", categories.name AS "categoryName"
           FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON "gameId" = games.id 
           JOIN categories ON games."categoryId" = categories.id
           WHERE rentals."gameId" = $1;`,
        [gameId]
      );

      return res.send(
        rentals.rows.map((i) => ({
          id: i.id,
          customerId: i.customerId,
          gameId: i.gameId,
          rentDate: i.rentDate,
          daysRented: i.daysRented,
          returnDate: i.returnDate,
          originalPrice: i.originalPrice,
          delayFee: i.delayFee,
          customer: {
            id: i.customerId,
            name: i.customername,
          },
          game: {
            id: i.gameId,
            name: i.gameName,
            categoryId: i.categoryId,
            categoryName: i.categoryName,
          },
        }))
      );
    } catch (err) {
      return res.sendStatus(500);
    }
  }

  try {
    const rentals = await connectionDB.query(
      `SELECT rentals.*, rentals.id AS "rentalId",
       customers.id , customers.name AS "customername", games.id, games.name AS "gameName", games."categoryId", categories.name AS "categoryName"
       FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON "gameId" = games.id 
       JOIN categories ON games."categoryId" = categories.id;`
    );
    console.log(rentals.rows);
    return res.send(
      rentals.rows.map((i) => ({
        id: i.rentalId,
        customerId: i.customerId,
        gameId: i.gameId,
        rentDate: i.rentDate,
        daysRented: i.daysRented,
        returnDate: i.returnDate,
        originalPrice: i.originalPrice,
        delayFee: i.delayFee,
        customer: {
          id: i.customerId,
          name: i.customername,
        },
        game: {
          id: i.gameId,
          name: i.gameName,
          categoryId: i.categoryId,
          categoryName: i.categoryName,
        },
      }))
    );
  } catch (err) {
    return res.sendStatus(500);
  }
}

export async function postRentalsReturnController(req, res) {
  const { id } = req.params;
  const { rental } = res.locals;
  const rentDate = dayjs(rental.rentDate);
  const date = dayjs().format("YYYY-MM-DD");
  const diff = rentDate.diff(date, "day");

  try {
    const delayDays = diff - rental.daysRented;
    if (delayDays <= 0) {
      connectionDB.query(
        `UPDATE rentals SET "returnDate"=$1, 
        "delayFee"=$2 WHERE id = $3`,
        [date, delayDays * rental.pricePerDay, id]
      );
    }

    connectionDB.query(
      `UPDATE rentals SET "returnDate"=$1, 
        "delayFee"=$2 WHERE id = $3`,
      [date, 0, id]
    );
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }

  return res.send(rental);
}

export async function deleteRentalsController(req, res) {
  const { id } = req.params;

  connectionDB.query(`DELETE FROM rentals WHERE id=$1`, [id]);

  return res.sendStatus(200);
}
