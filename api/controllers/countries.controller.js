import { Country } from "country-state-city";

export const getCountry = async (req, res, next) => {
  try {
    const { countryName } = req.body;

    if (!countryName) {
      return res.status(400).json({ success: false, message: "Country name is required" });
    }

    const countries = Country.getAllCountries();

    const country = countries.find(country => country.name === countryName);

    if (!country) {
      return res.status(404).json({ success: false, message: "Country not found" });
    }

    const countryData = {
      name: country.name,
      code: country.isoCode,
    };

    return res.status(200).json({ success: true, country: countryData });
  } catch (error) {
    next(error);
  }
};
