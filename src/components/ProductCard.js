import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fCurrency } from "../utils";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleGoToDetail = () => {
    navigate(`/product/${product.productid}`);
  };

  const handleGoToPayment = () => {
    navigate(`/payment/${product.productid}`);
  };

  return (
    <Card>
      <CardActionArea onClick={handleGoToDetail}>
        <CardMedia
          component="img"
          height="200"
          image={product.imageurl}
          alt={product.name}
        />
        <CardContent>
          <Typography gutterBottom variant="body1" component="div" noWrap>
            {product.name}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="flex-end"
          >
            {product.priceSale && (
              <Typography
                component="span"
                sx={{ color: "text.disabled", textDecoration: "line-through" }}
              >
                {fCurrency(product.priceSale)}
              </Typography>
            )}
            <Typography variant="subtitle1">
              {fCurrency(product.price)}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      {/* Pay Now button OUTSIDE CardActionArea to avoid accidental navigation */}
      <CardContent>
        <Button variant="contained" fullWidth onClick={handleGoToPayment}>
          Pay Now
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
