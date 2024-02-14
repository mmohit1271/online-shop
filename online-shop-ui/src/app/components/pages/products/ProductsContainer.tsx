/*
 * MIT License
 *
 * Copyright (c) 2023 Artiom Bozieac
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

import Copyright from '../../footer/Copyright';
import Header from '../../Header';
import ProductCard from './ProductCard';
import { getProducts } from '../../../api/ProductRequest';
import Product from './Product';

import { useAppSelector } from '../../../hooks';
import { useNavigate } from 'react-router-dom';

const ProductsContainer = () => {
  const jwt = useAppSelector(state => state.jwt);

  const [products, setProducts] = React.useState<Product[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = jwt.token;

    const fetchProducts = async () => {
      const productsResponse = await getProducts(token);

      if(productsResponse.status) {
        if(productsResponse.status == 401) {
          navigate("/login");
        }
      }

      setProducts(productsResponse);
    }

    fetchProducts(); // NOSONAR: It should not await.
  }, []);

  return (
    <Container component="main" maxWidth={false} id="main-container" disableGutters>
      <Header />
      <Grid container justifyContent="center" alignItems="center" columnGap={2}>
        {products.length > 0 && products.map(product => {
          return (<ProductCard key={product.objectID} id={product.objectID} title={product.name} price={product.price} categories={product.categories} shouldBeAbleToDelete={false} />);
        })}
      </Grid>
      <Copyright />
    </Container>
  );
}

export default ProductsContainer;