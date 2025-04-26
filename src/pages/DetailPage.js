import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  Container,
  Typography,
  Box,
  Stack,
  Divider,
  Breadcrumbs,
  Link,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import apiService from "../app/apiService";
import LoadingScreen from "../components/LoadingScreen";

function DetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiService.get(`/api/products/${id}`);
        setProduct(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch product.");
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  return (
    <Container sx={{ my: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
        <Link underline="hover" color="inherit" component={RouterLink} to="/">
          Supermarket
        </Link>
        <Typography color="text.primary">
          {product?.name || "Product"}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ position: "relative", height: 1 }}>
        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : product ? (
          <Card>
            <Grid container>
              <Grid item xs={12} md={6}>
                <Box p={2}>
                  <Box
                    component="img"
                    sx={{
                      borderRadius: 2,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    src={product.imageurl}
                    alt={product.name}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6} sx={{ p: 3 }}>
                <Typography variant="h4">{product.name}</Typography>

                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  ${Number(product.price).toFixed(2)}
                </Typography>

                <Typography variant="body1">
                  <strong>Remaining:</strong> {product.remaining}
                </Typography>

                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Category:</strong> {product.categoryname}
                </Typography>

                <Typography variant="body1">
                  <strong>Warehouse:</strong> {product.warehousename}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary">
                  Product ID: {product.productid}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        ) : (
          <Typography variant="h6">404 Product not found</Typography>
        )}
      </Box>
    </Container>
  );
}

export default DetailPage;
