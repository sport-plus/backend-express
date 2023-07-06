const validateAttributesCreateSportCenter = (req, res, next) => {
    const data = req.body; // Assuming the JSON data is in the request body

    // Define the required attributes
    const requiredAttributes = ['name', 'image', 'address', 'description', 'latitude', 'longitude', 'openTime', 'closeTime', 'status', 'sportId', 'totalrating', 'priceOption'];

    // Check if all required attributes are present
    // const missingAttributes = requiredAttributes.filter(attr => !data.hasOwnProperty(attr));
    // if (missingAttributes.length > 0) {
    //     return res.status(400).json({ error: `Missing required attributes: ${missingAttributes.join(', ')}` });
    // }

    // Additional attribute validations
    if (!Array.isArray(data.priceOption)) {
        return res.status(400).json({ error: 'Invalid attribute: priceOption must be an array' });
    }

    // Validate each price option
    for (const option of data.priceOption) {
        // if (!option.fieldType || !Array.isArray(option.listPrice)) {
        //     return res.status(400).json({ error: 'Invalid attribute: priceOption must contain fieldType and listPrice' });
        // }

        // for (const price of option.listPrice) {
        //     if (!price.timeStart || !price.timeEnd || !price.price) {
        //         return res.status(400).json({ error: 'Invalid attribute: listPrice must contain timeStart, timeEnd, and price' });
        //     }

        //     if (typeof price.timeStart !== 'number' || typeof price.timeEnd !== 'number' || typeof price.price !== 'number') {
        //         return res.status(400).json({ error: 'Invalid attribute: timeStart, timeEnd, and price must be numbers' });
        //     }
        // }
        if (!option.slots && !Array.isArray(option.slots)) {
            return res.status(400).json({ error: 'Invalid attribute: slots must be an array' });
        }
    }

    // If all validations pass, move to the next middleware or route handler
    next();
};

module.exports = {
    validateAttributesCreateSportCenter
}