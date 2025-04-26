import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import FRadioGroup from "./form/FRadioGroup"; // Adjust the import path as needed
import ClearAllIcon from "@mui/icons-material/ClearAll";
import apiService from "../app/apiService";

export const SORT_BY_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "priceDesc", label: "Price: High-Low" },
  { value: "priceAsc", label: "Price: Low-High" },
];

export const FILTER_PRICE_OPTIONS = [
  { value: "below", label: "Below $25" },
  { value: "between", label: "Between $25 - $75" },
  { value: "above", label: "Above $75" },
];

function ProductFilter({ resetFilter }) {
  const [categoryOptions, setCategoryOptions] = useState([{ value: "0", label: "All" }]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.get("/api/categories");
        const categories = response.data.map((c) => ({
          value: c.categoryid.toString(),
          label: c.name,
        }));
        console.log("Fetched categories:", categories);
        setCategoryOptions([{ value: "0", label: "All" }, ...categories]);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Stack spacing={3} sx={{ p: 3, width: 250 }}>
      {/* Category Filter */}
      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Category
        </Typography>
        <FRadioGroup
          name="categoryid"
          options={categoryOptions}
          getOptionLabel={(option) => option.label}
          keyExtractor={(option) => option.value}
        />
      </Stack>

      {/* Price Filter */}
      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Price
        </Typography>
        <FRadioGroup
          name="priceRange"
          options={FILTER_PRICE_OPTIONS}
          getOptionLabel={(option) => option.label}
          keyExtractor={(option) => option.value}
        />
      </Stack>

      {/* Clear All Button */}
      <Box>
        <Button
          size="large"
          type="button"
          color="inherit"
          variant="outlined"
          onClick={resetFilter}
          startIcon={<ClearAllIcon />}
        >
          Clear All
        </Button>
      </Box>
    </Stack>
  );
}

export default ProductFilter;