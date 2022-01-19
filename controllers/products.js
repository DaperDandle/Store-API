const getAllProductsStatic = async (req, res) => {
  res.status(200).json({ msg: "products Testing route" });
};

const getAllProducts = async (req, res) => {
  res.status(200).json({ msg: "products route" });
};

module.exports = { getAllProducts, getAllProductsStatic };
