const asyncHandler = require('express-async-handler');
const SportFields = require('../models/sportFieldModel');
const SportCenters = require('../models/sportCenterModel');
const DatePrices = require('../models/datePriceModel');
const Slots = require('../models/slotModel');

const createSportField = async (req, res) => {
  /* 
    #swagger.tags = ['Sport Field']
    #swagger.description = Create new sport field - {
      "sportCenterId": "646c46787a6bd46e911d5db4",
      "name": "Sân cỏ nhân tạo",
      "images":[
          "image-1",
          "image-2",
          "image-3",
      ],
      "price": 200000
    }
  */
  const { sportCenterId, name, images, price, fieldType } = req.body;

  const sportField = {
    name,
    images,
    price,
    fieldType,
  };

  try {
    const newSportField = await SportFields.create(sportField);
    addToSportCenter(sportCenterId, newSportField);

    res.status(201).json({
      status: 201,
      message: 'Sport Field created successfully.',
      newSportField: newSportField,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: 'Sport Field created fail.',
    });
  }
};
const addDatePrices = async (sportFieldsId, priceOption) => {
  const weeks = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  const datePrice = []

  priceOption.forEach(element => {

    if (element.timeEnd) {

      let timeStart = element.timeStart

      while (timeStart <= element.timeEnd) {
        datePrice.push({
          sportFieldsId,
          price: element.price,
          weekday: weeks[timeStart]
        })
        timeStart++
      }
    } else {
      datePrice.push({
        sportFieldsId,
        price: element.price,
        weekday: weeks[timeStart]
      })
    }
  });

  await DatePrices.insertMany(datePrice)
}
const addToSportCenter = async (sportCenterId, newSportField) => {
  try {
    const sportCenter = await SportCenters.findById(sportCenterId);
    const alreadySportField = sportCenter.sportFields.find(
      (id) => id.toString() === newSportField._id
    );

    if (!alreadySportField) {
      await SportCenters.findByIdAndUpdate(
        sportCenterId,
        {
          $push: { sportFields: newSportField._id }, //Thêm vào mảng sportCenters
        },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error);
  }
};
const getSportFieldsTypeOfSportCenter = async (req, res) => {
  const { sportCenterId } = req.query
  try {
    const fieldTypes = []
    const x = (await SportFields.find({ sportCenter: sportCenterId }))

    x.forEach(i => {
      if (!fieldTypes.find(field => field.fieldType === i.fieldType) ) {
        fieldTypes.push(i.fieldType)
      }
    })


  


    return res.status(201).json({
      fieldTypes
    })
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
}
const getAllSportFields = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Field']
    #swagger.description = "Create new sport field"
  */
  try {
    const listSportFields = await SportFields.find();
    return res.status(200).json({
      status: 200,
      results: listSportFields.length,
      listSportFields: listSportFields,
    });
  } catch (error) {
    throw new Error(error);
  }
});


const getSportField = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Field']
    #swagger.description = "Get one sport field - detail sport field"
  */
  const { id } = req.params;
  let isValid = await SportFields.findById(id);
  if (!isValid) {
    throw new Error('Sport id is not valid or not found');
  }

  try {
    const getSportField = await SportFields.findById(id);
    const getDatePrice = await DatePrices.find({ sportFieldId: id });
    const getSlot = await Slots.find({ sportFieldId: id });

    // console.log(getDatePrice);
    res.status(200).json({
      status: 200,
      getSportField: getSportField,
      getDatePrice: getDatePrice,
      getSlot: getSlot
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateSportField = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Field']
    #swagger.description = Update sport field by ID - {
      "name": "Sân cỏ nhân tạo",
      "images":[
          "image-1",
          "image-2",
          "image-3",
      ],
      "price": 200000
    }
  */
  const { id } = req.params;
  const { name, images, price, fieldType } = req.body;
  let isValid = await SportFields.findById(id);
  if (!isValid) {
    throw new Error('Sport id is not valid or not found');
  }

  try {
    const updateSportField = await SportFields.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: 200,
      message: 'Sport updated successfully.',
      updateSportField: updateSportField,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockSportField = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Field']
    #swagger.description = "Update sport field status by ID - Block sport field"
  */
  const { id } = req.params;
  let isValid = await SportFields.findById(id);
  if (!isValid) {
    res.status(404).json({
      status: 404,
      message: 'Sport field id is not valid or not found',
    });
  }

  try {
    const block = await SportFields.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Sport Field Blocked.',
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error,
    });
  }
});

const unBlockSportField = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Field']
    #swagger.description = "Update sport field status by ID - Unblock sport field"
  */
  const { id } = req.params;
  let isValid = await SportFields.findById(id);
  if (!isValid) {
    throw new Error('Sport id is not valid or not found');
  }

  try {
    const block = await SportFields.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Sport Field Unblocked.',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteSportField = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Field']
    #swagger.description = "Delete sport field by ID"
  */
  const { id, sportCenterId } = req.params;
  let isValid = await SportFields.findById(id);
  if (!isValid) {
    throw new Error('Sport id is not valid or not found');
  }

  try {
    const deleteSportField = await SportFields.findByIdAndDelete(id);
    removeToSportCenter(sportCenterId, id);
    res.status(200).json({
      status: 200,
      message: 'Sport Field deleted successfully.',
      deleteSportField: deleteSportField,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const removeToSportCenter = async (sportCenterId, sportFieldId) => {
  try {
    const sportCenter = await SportCenters.findById(sportCenterId);
    const alreadySportField = sportCenter.sportFields.find(
      (id) => id.toString() === sportFieldId
    );

    if (alreadySportField) {
      await SportCenters.findByIdAndUpdate(
        sportCenterId,
        {
          $pull: { sportFields: sportFieldId }, //Thêm vào mảng sportCenters
        },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createSportField,
  getAllSportFields,
  getSportField,
  updateSportField,
  deleteSportField,
  blockSportField,
  unBlockSportField,
  getSportFieldsTypeOfSportCenter
};
