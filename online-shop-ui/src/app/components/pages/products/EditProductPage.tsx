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
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { addProduct, getProductPhoto, setProductPhoto, updateProduct } from '../../../api/ProductRequest';
import Alert from '@mui/material/Alert';
import OutlinedInput from '@mui/material/OutlinedInput';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import { InputError } from '../../../utils/InputErrorUtils';
import { getFieldInputErrorMessage, isFieldPresentInInputErrors } from '../../../utils/InputErrorUtils';
import InputFields from '../../../utils/InputFields';
import { Paper, Input, Snackbar } from '@mui/material';
import { useLocation, useNavigate } from "react-router-dom";
import { Category } from './AddProductPage';

import Header from '../../Header';
import Copyright from '../../footer/Copyright';

import { useAppSelector } from '../../../hooks'
import { Stack, Typography } from '@mui/material';
import { getCategories } from '../../../api/CategoryRequest';
import { getTranslation } from '../../../../i18n/i18n';

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: 48 * 4.5 + 8,
            width: 350,
        },
    },
};

const currencies = [
    {
        value: 'EUR',
        label: '€',
    },
];

const AddProductPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const lang = useAppSelector(state => state.lang.lang);
    const roles = useAppSelector(state => state.roles);
    const jwt = useAppSelector(state => state.jwt);

    const [name, setName] = React.useState(location.state ? location.state.title : "default");
    const [price, setPrice] = React.useState(location.state ? location.state.price : 0.01);
    const [categories, setCategories] = React.useState<string[]>(location.state ? location.state.categories ? location.state.categories.map((category: Category) => category.name) : [] : []);
    const [fetchedCategories, setFetchedCategories] = React.useState<Category[]>([]);

    const [inputErrors, setInputErrors] = React.useState<InputError[]>([]);
    const [error, setError] = React.useState("");
    const [isSuccess, setSuccess] = React.useState(false);

    const [photo, setPhoto] = React.useState("");
    const [file, setFile] = React.useState<File | null>(null);

    const handleAlertClick = () => {
        setSuccess(false);
        setError("");
    };

    React.useEffect(() => {
        const token = jwt.token;

        const fetchCategories = async () => {
            const categoriesRequest = await getCategories(token);

            if (categoriesRequest.status) {
                if (categoriesRequest.status == 401) {
                    navigate("/login");
                }
            }

            setFetchedCategories(categoriesRequest);
        }

        fetchCategories(); // NOSONAR: It should not await.

        const getProductPhotoRequest = async () => {
            const photoBlob = await getProductPhoto(location.state ? location.state.id : "1");
            setPhoto(URL.createObjectURL(photoBlob));
            setFile(photoBlob as File);
        }

        getProductPhotoRequest();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setSuccess(false);
        setInputErrors([]);
        setError("");

        let categoriesDTO: Category[] = [];
        categories.forEach((category) => {
            fetchedCategories.forEach((fetchedCategory) => {
                if (fetchedCategory.name.localeCompare(category) == 0) {
                    const categoryDTO = {
                        id: fetchedCategory.id,
                        name: fetchedCategory.name
                    }

                    categoriesDTO.push(categoryDTO);
                }
            }
            )
        })

        const response = await updateProduct(jwt.token, location.state ? location.state.id : 1, name, categoriesDTO, price);

        if (response.error) {
            setError(response.error);
        } else if (response.fieldErrors) {
            setInputErrors(response.fieldErrors);
        } else {
            if (file != null) {
                await setProductPhoto(jwt.token, location.state ? location.state.id : 1, file);
            }

            setSuccess(true);
        }
    }

    const handleCategoriesChange = (event: SelectChangeEvent<typeof categories>) => {
        const { target: { value }, } = event;
        setCategories(typeof value === 'string' ? value.split(',') : value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);

            let reader = new FileReader();
            reader.readAsDataURL(e.target.files[0] as Blob);
            reader.onload = function () {
                setPhoto(reader.result as string);
            };
        }
    };

    return (
        <Container component="main" maxWidth={false} id="main-container" disableGutters>
            <Header />
            {// @ts-ignore 
                roles.roles.roles[0].name == "SELLER"
                    ? (<Box
                        onSubmit={event => handleSubmit(event)}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '50ch' },
                        }}
                        noValidate
                        autoComplete="off"
                        margin="2%"
                    >
                        <Stack
                            alignItems="center"
                            justifyContent="center">
                            {isSuccess &&
                                <Snackbar open={isSuccess} autoHideDuration={2000} onClose={handleAlertClick}>
                                    <Alert data-testid="alert-success" onClose={handleAlertClick} severity="success" sx={{ width: '100%' }}>
                                        {getTranslation(lang, "product_updated_successfully")}
                                    </Alert>
                                </Snackbar>}
                            {error.length > 0 &&
                                <Snackbar open={error.length > 0} autoHideDuration={2000} onClose={handleAlertClick}>
                                    <Alert data-testid="alert-error" onClose={handleAlertClick} severity="error" sx={{ width: '100%' }}>
                                        {getTranslation(lang, error)}
                                    </Alert>
                                </Snackbar>}
                            <Box className="my-profile-image-container">
                                <Paper sx={{ border: 0, boxShadow: "none", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                    <img width="196" height="196" className="user-image" src={photo} data-testid="photo" />
                                    <Box className="my-profile-image-information-container">
                                        <Input id='file' type='file' onChange={handleFileChange} data-testid="photo-selector"></Input>
                                    </Box>
                                </Paper>
                            </Box>
                            <TextField
                                error={isFieldPresentInInputErrors(InputFields.NAME, inputErrors)}
                                helperText={isFieldPresentInInputErrors(InputFields.NAME, inputErrors) ? getFieldInputErrorMessage(InputFields.NAME, inputErrors) : null}
                                value={name}
                                onChange={(event) => { setName(event.target.value) }}
                                required
                                id="name-field"
                                data-testid="name-field"
                                label={getTranslation(lang, "name")}
                                sx={{ width: "75%" }} />
                            <TextField
                                id="currency-field"
                                data-testid="currency-field"
                                select
                                label={getTranslation(lang, "currency")}
                                defaultValue="EUR"
                                helperText={getTranslation(lang, "select-currency")}
                            >
                                {currencies.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Select
                                id="categories-field"
                                data-testid="categories-field"
                                displayEmpty
                                multiple
                                label={getTranslation(lang, "categories")}
                                value={categories}
                                onChange={handleCategoriesChange}
                                input={<OutlinedInput />}
                                renderValue={(selected) => (
                                    selected.length === 0
                                        ? (<em>{getTranslation(lang, "categories")}</em>)
                                        : (<Box sx={{ display: 'grid', flexWrap: 'wrap', gap: 0.5, maxWidth: "100%" }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>)
                                )}
                                MenuProps={MenuProps}
                                sx={{ width: "95%", mb: "3%", maxWidth: "95%" }}
                            >

                                {fetchedCategories.map((fetchedCategory) => (
                                    <MenuItem key={fetchedCategory.name} value={fetchedCategory.name}>
                                        <Checkbox checked={categories.indexOf(fetchedCategory.name) > -1} />
                                        <ListItemText primary={fetchedCategory.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                            <TextField
                                error={isFieldPresentInInputErrors(InputFields.PRICE, inputErrors)}
                                helperText={isFieldPresentInInputErrors(InputFields.PRICE, inputErrors) ? getFieldInputErrorMessage(InputFields.PRICE, inputErrors) : null}
                                value={price}
                                onChange={(event) => { setPrice(Number(event.target.value)) }}
                                required
                                id="price-field"
                                data-testid="price-field"
                                label={getTranslation(lang, "price")}
                                type="number"
                                inputProps={{ min: 0 }} />
                            <Button
                                type="submit"
                                data-testid="submit-button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {getTranslation(lang, "update")}
                            </Button>
                        </Stack>
                    </Box>)
                    : (<Typography align='center' marginTop={10}>{getTranslation(lang, "no_rights_to_access")}</Typography>)}
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
    );
}

export default AddProductPage;