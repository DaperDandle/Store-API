const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({ price: { $gt: 25 } })
    .select("name price")
    .sort("price");
  res.status(200).json({ products, nbHits: products.length });
};

const getAllProducts = async (req, res) => {
  // pull search and sorting options from query
  const { featured, name, company, sort, fields, numericFilters } = req.query;

  const queryObj = {};

  if (featured) {
    queryObj.featured = featured === "true" ? true : false;
  }

  if (name) {
    // case insinsitive
    queryObj.name = { $regex: name, $options: "i" };
  }

  if (company) {
    queryObj.company = company;
  }

  if (numericFilters) {
    // map symbols to mongoose operators
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    // matches operator symbols
    const regEx = /\b(>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      // add operator with replaced value between hyphens for easy splitting
      (match) => `-${operatorMap[match]}-`
    );

    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObj[field] = { [operator]: Number(value) };
      }
    });
  }
  console.log(queryObj);
  let result = Product.find(queryObj);
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("name");
  }

  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const products = await result;

  res.status(200).json({ products, nbHits: products.length });
};

module.exports = { getAllProducts, getAllProductsStatic };
