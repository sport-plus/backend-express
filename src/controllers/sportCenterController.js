const asyncHandler = require('express-async-handler');
const SportCenters = require('../models/sportCenterModel');
const Users = require('../models/userModel');
const Sports = require('../models/sportModel');
const DatePrices = require('../models/datePriceModel');
const SportFields = require('../models/sportFieldModel');
const Slots = require('../models/slotModel');
const Bookings = require('../models/bookingModel');


const getListPrice = async (req, res, next) => {
  const {sportCenterId} = req.query
  try {
    const sportFields = await SportFields.find({sportCenter: sportCenterId});
 
   
    return res.status(201).json({
      status: 201,
      message: 'Sport Center created successfully.',
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
}

const createSportCenter = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Center']
    #swagger.description = Create new sport center - {
      "name": "Sân bóng đá mini Tiến Minh",
      image: "",
      "address":"Số 141 – đường 339 – Phường Phước Long – Quận 9 – TPHCM",
      "latitude":"25.0359",
      "longtitude":"66.6431",
      "openTime":"08:00",
      "closeTime":"22:00",
      "sportId": "646b3fb2fb8ee6a504e04826"
    }
  */
  const imageDefault =
    'https://firebasestorage.googleapis.com/v0/b/thethaoplus-4d4e2.appspot.com/o/sport_center.png?alt=media&token=50735feb-b144-4ae1-86c9-c47b955ae25a';

  const { _id } = req.user;
  const {
    sportId,
    name,
    image,
    address,
    description,
    latitude,
    longtitude,
    openTime,
    closeTime,
    priceOption,
    totalrating,
    status,
    ratings,
  } = req.body;
  const newSportCenterBody = {
    name,
    image: image ? image : imageDefault,
    address,
    description,
    latitude,
    longtitude,
    openTime,
    closeTime,
    owner: _id,
    sport: sportId,
    priceOption
  };
console.log(priceOption);
  try {
    const newSportCenter = await SportCenters.create(newSportCenterBody);
    await addToOwnerAndSport(_id, sportId, newSportCenter);
    const fields = await createSportFields(newSportCenter.id, priceOption);
    await addDatePrices(fields, priceOption);
    await addSlots(fields, priceOption);
    return res.status(201).json({
      status: 201,
      message: 'Sport Center created successfully.',
      newSportCenter: newSportCenter,
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
});

const addSlots = async (fields, priceOption) => {
  const newSlots = [];

  priceOption.forEach((price, index) => {
    const slots = price.slots;
    fields.forEach((field, slot) => {
      if (price.fieldType === field.fieldType) {
        newSlots.push({
          sportFieldId: field.id,
          availability: slots,
        });
      }
    })

  });

  await Slots.insertMany(newSlots);
};

const addDatePrices = async (fields, priceOption) => {
  const weeks = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const datePrices = [];
  priceOption.forEach((price, index) => {
    const listPrices = price.listPrice;
    listPrices.forEach((listPrice) => {
      let timeStart = listPrice.timeStart;
      fields.forEach((field) => {
        if (price.fieldType === field.fieldType) {
          const datePrice = {
            sportFieldId: field.id,
            price: listPrice.price,
            weekday: weeks[timeStart],
          };
          if (listPrice.timeEnd)
            while (timeStart <= listPrice.timeEnd) {
              datePrices.push({
                ...datePrice,
                weekday: weeks[timeStart],
              });
              timeStart++;
            }
          else {
            datePrices.push(datePrice);
          }
        }
      })

    });

  });

  await DatePrices.insertMany(datePrices);
};


const createSportFields = async (sportCenterId, priceOption) => {
  const sportFields = [];
  console.log(priceOption);
  priceOption.forEach((element) => {
    if (element.quantity >= 1) {
      for (let index = 1; index <= element.quantity; index++) {
        sportFields.push({
          fieldType: element.fieldType,
          sportCenter: sportCenterId,
          status: true,
          index
        })
      }
    }
  });

  return await SportFields.insertMany(sportFields);
};
const addToOwnerAndSport = async (userId, sportId, newSportCenter) => {
  try {
    const user = await Users.findById(userId);
    const alreadySportCenter = user.sportCenters.find(
      (id) => id.toString() === newSportCenter._id
    );

    const sport = await Sports.findById(sportId);
    const alreadySportCenterInSport = sport.sportCenters.find(
      (id) => id.toString() === newSportCenter._id
    );

    if (!alreadySportCenter) {
      await Users.findByIdAndUpdate(
        userId,
        {
          $push: { sportCenters: newSportCenter._id }, //Thêm vào mảng sportCenters
        },
        { new: true }
      );
    }

    if (!alreadySportCenterInSport) {
      await Sports.findByIdAndUpdate(
        sportId,
        {
          $push: { sportCenters: newSportCenter._id }, //Thêm vào mảng sportCenters
        },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

// For user
const getAllSportCenters = asyncHandler(async (req, res) => {
  const { sportId, address, fieldType, date } = req.query;
  /*  
    #swagger.tags = ['Sport Center']
    #swagger.description = "Get all sport center for customers"
  */ const query = {};

  if (address) {
    query.address = { $regex: `.*${address}.*`, $options: 'i' };
  }

  if (sportId) {
    query.sport = sportId;
  }

  try {
    let sportCenterIds = [];

    if (fieldType) {
      const sportFields = await SportFields.find({ fieldType: fieldType });
      sportCenterIds = sportFields.map((sportField) => sportField.sportCenter);
    }
    if (sportCenterIds.length === 0) {
      const listSportCenter = await SportCenters.find(query).populate('sport');
      if (date) {
        let listFilterSportCenter = [];

        for (const sportCenter of listSportCenter) {
          const listSportField = await SportFields.find({
            sportCenter: sportCenter._id,
          });

          for (const field of listSportField) {
            const slots = await Slots.find({
              sportFieldId: field._id,
            });

            const bookings = await Bookings.find({
              $and: [
                { sportField: field._id },
                { date: new Date(date).setHours(0, 0, 0, 0) },
              ],
            });

            if (bookings.length > 0) {
              let hasOverlap = false;

              for (const booking of bookings) {
                for (const slot of slots) {
                  if (
                    booking.start === slot.startTime &&
                    booking.end === slot.endTime
                  ) {
                    hasOverlap = true;
                    break;
                  }
                }
                if (hasOverlap) {
                  break;
                }
              }

              if (!hasOverlap) {
                listFilterSportCenter.push(sportCenter);
              }
            } else {
              listFilterSportCenter = [...listSportCenter];
            }
          }
        }

        res.status(200).json({
          status: 200,
          results: listFilterSportCenter.length,
          listSportCenter: listFilterSportCenter,
        });
      } else {
        res.status(200).json({
          status: 200,
          results: listSportCenter.length,
          listSportCenter: listSportCenter,
        });
      }
    } else {
      const listSportCenter = await SportCenters.find({
        _id: { $in: sportCenterIds },
        ...query,
      }).populate('sport');
      res.status(200).json({
        status: 200,
        results: listSportCenter.length,
        listSportCenter: listSportCenter,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

const getAllSportCenterForOwner = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Center']
    #swagger.description = "Get all sport center for owner by id"
  */
  const { _id } = req.user;
  console.log(_id);
  let isValid = await Users.findById(_id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }
  try {
    const sportCenterOfOwner = await SportCenters.find({ owner: _id }).populate(
      'sport'
    );
    res.status(200).json({
      status: 200,
      results: sportCenterOfOwner.length,
      sportCenterOfOwner: sportCenterOfOwner,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getSportCenter = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Center']
    #swagger.description = "Get one sport center - detail sport center"
  */
  const { id } = req.params;
  let isValid = await SportCenters.findById(id);
  if (!isValid) {
    throw new Error('Sport Center id is not valid or not found');
  }

  try {
    const getSportCenter = await SportCenters.findById(id)
      .populate('owner')
      .populate('sport');
    console.log(getSportCenter);
    const getSportField = await SportFields.find({ sportCenter: id });
    const sportFieldsWithSlots = await Promise.all(
      getSportField.map(async (sportField) => {
        const slots = await Slots.find({ sportFieldId: sportField._id });
        return {
          ...sportField.toObject(),
          slots,
        };
      })
    );
    res.status(200).json({
      status: 200,
      getSportCenter: getSportCenter,
      getSportField: sportFieldsWithSlots,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateSportCenter = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Center']
    #swagger.description = Update sport center by ID - {
      "name": "Sân bóng đá mini Tiến Minh",
      "image": "",
      "address":"Số 141 – đường 339 – Phường Phước Long – Quận 9 – TPHCM",
      "latitude":"25.0359",
      "longtitude":"66.6431",
      "openTime":"08:00",
      "closeTime":"22:00",
      "sportId": "646b3fb2fb8ee6a504e04826"
    }
  */
  const { id } = req.params;
  let isValid = await SportCenters.findById(id);
  if (!isValid) {
    throw new Error('Sport Center id is not valid or not found');
  }

  const imageDefault =
    'https://firebasestorage.googleapis.com/v0/b/thethaoplus-4d4e2.appspot.com/o/sport_center.png?alt=media&token=50735feb-b144-4ae1-86c9-c47b955ae25a';

  const { _id } = req.user;
  const {
    sportId,
    name,
    image,
    address,
    latitude,
    longtitude,
    openTime,
    closeTime,
  } = req.body;
  const updateSportCenterBody = {
    name,
    image: image ? image : imageDefault,
    address,
    latitude,
    longtitude,
    openTime,
    closeTime,
    owner: _id,
    sport: sportId,
  };
  try {
    const updateSportCenter = await SportCenters.findByIdAndUpdate(
      id,
      updateSportCenterBody,
      {
        new: true,
      }
    );
    res.status(200).json({
      status: 200,
      message: 'Sport Center updated successfully.',
      updateSportCenter: updateSportCenter,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockSportCenter = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Center']
    #swagger.description = "Update sport center status by ID - Block sport center"
  */
  const { id } = req.params;
  let isValid = await SportCenters.findById(id);
  if (!isValid) {
    throw new Error('Sport Center id is not valid or not found');
  }

  try {
    const block = await SportCenters.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Sport Center Blocked.',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unBlockSportCenter = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Center']
    #swagger.description = "Update sport center status by ID - Unblock sport center"
  */
  const { id } = req.params;
  let isValid = await SportCenters.findById(id);
  if (!isValid) {
    throw new Error('Sport Center id is not valid or not found');
  }

  try {
    const block = await SportCenters.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Sport Center Unblocked.',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteSportCenter = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Center']
    #swagger.description = "Delete sport center by ID"
  */
  const { id: sportCenterId, sportId } = req.params;
  const { _id: userId } = req.user;

  let isValid = await SportCenters.findById(sportCenterId);
  if (!isValid) {
    throw new Error('Sport Center id is not valid or not found');
  }

  try {
    const deleteSportCenter = await SportCenters.findByIdAndDelete(
      sportCenterId
    );
    removeOwnerAndSport(userId, sportId, sportCenterId);
    res.status(200).json({
      status: 200,
      message: 'Sport Center deleted successfully.',
      deleteSportCenter: deleteSportCenter,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: 'Delete sport center fail.',
    });
  }
});

const removeOwnerAndSport = async (userId, sportId, sportCenterId) => {
  try {
    const user = await Users.findById(userId);
    const alreadySportCenter = user.sportCenters.find(
      (id) => id.toString() === sportCenterId
    );

    const sport = await Sports.findById(sportId);
    const alreadySportCenterInSport = sport.sportCenters.find(
      (id) => id.toString() === sportCenterId
    );

    if (alreadySportCenter) {
      await Users.findByIdAndUpdate(
        userId,
        {
          $pull: { sportCenters: sportCenterId }, //Xoa vào mảng sportCenters
        },
        { new: true }
      );
    }

    if (alreadySportCenterInSport) {
      await Sports.findByIdAndUpdate(
        sportId,
        {
          $pull: { sportCenters: sportCenterId }, //Xoa vào mảng sportCenters
        },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const getSportFieldListByID = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Field']
    #swagger.description = "Get all sport field by sport center's ID"
  */
  const { sportCenterId } = req.params;
  let isValid = await SportCenters.findById(sportCenterId);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }

  try {
    const findSportField = await SportFields.find({
      sportCenter: sportCenterId,
    });
    res.status(200).json({
      status: 200,
      SportFieldList: findSportField,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createSportCenter,
  getAllSportCenters,
  getAllSportCenterForOwner,
  getSportCenter,
  updateSportCenter,
  deleteSportCenter,
  blockSportCenter,
  unBlockSportCenter,
  getSportFieldListByID,
};
