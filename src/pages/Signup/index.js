import React, { useState, useEffect } from "react";
import qs from 'query-string';
import axios from 'axios';
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import logo from "../../assets/logo.png";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";

const useStyles = makeStyles(theme => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	formButton: {
		padding: "7%",
		width: "95%",
		marginTop: theme.spacing(0.5),
	},
	headerText: {
		color: "#0000FF", // Azul semelhante ao da imagem
		fontWeight: "bold",
		fontFamily: "Arial Black, Impact, sans-serif", // Fontes similares
		fontSize: "24px", // Tamanho de fonte ajustado
		textAlign: "center",
		marginBottom: theme.spacing(2),
	},
	subHeaderText: {
		color: "#0000FF", // Azul semelhante ao da imagem
		fontWeight: "bold",
		fontFamily: "Arial Black, Impact, sans-serif", // Fontes similares
		fontSize: "16px", // Tamanho de fonte ajustado
		textAlign: "center",
		marginBottom: theme.spacing(2),
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string()
		.min(5, "Too Short!")
		.max(150, "Too Long!")
		.required("Required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password'), null], 'Passwords must match')
		.required("Required"),
	email: Yup.string().email("Invalid email").required("Required"),
	phone: Yup.string()
		.min(10, "Too Short!")
		.max(15, "Too Long!")
		.required("Required"),
});

const SignUp = () => {
	const classes = useStyles();
	const history = useHistory();
	let companyId = null;

	const params = qs.parse(window.location.search);
	if (params.companyId !== undefined) {
		companyId = params.companyId;
	}

	const initialState = { name: "", email: "", phone: "", password: "", confirmPassword: "", planId: "6" };

	const [user, setUser] = useState(initialState);
	const dueDate = moment().add(3, "day").format();

	const handleSignUp = async values => {
		const { name, email, phone, password, planId } = values;
		const newUser = { name, email, phone, password, planId, recurrence: "MENSAL", dueDate, status: "t", campaignsEnabled: true };
		
		try {
			await openApi.post("/companies/cadastro", newUser);
			toast.success(i18n.t("signup.toasts.success"));
			history.push("/login");
		} catch (err) {
			console.log(err);
			toastError(err);
		}
	};

	const [plans, setPlans] = useState([]);
	const { list: listPlans } = usePlans();

	useEffect(() => {
		async function fetchData() {
			const list = await listPlans();
			setPlans(list);
		}
		fetchData();
	}, []);

	useEffect(() => {
		// Carrega o Pixel do Facebook
		const loadFacebookPixel = () => {
			(function(f, b, e, v, n, t, s) {
				if (f.fbq) return;
				n = f.fbq = function() {
					n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
				};
				if (!f._fbq) f._fbq = n;
				n.push = n;
				n.loaded = !0;
				n.version = '2.0';
				n.queue = [];
				t = b.createElement(e);
				t.async = !0;
				t.src = v;
				s = b.getElementsByTagName(e)[0];
				s.parentNode.insertBefore(t, s);
			})(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

			window.fbq('init', '1000438255194487');
			window.fbq('track', 'PageView');
		};
		loadFacebookPixel();
	}, []);

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>

				{/* Texto no topo */}
				<Typography component="h1" variant="h5" className={classes.headerText}>
					COMECE O SEU TESTE GRÁTIS!
					<br />
					<Typography component="span" className={classes.subHeaderText}>
						TODAS INFORMAÇÃO DOS SEUS ATENDIMENTOS EM UM SÓ LUGAR.
					</Typography>
					<br />
					<Typography component="span" className={classes.subHeaderText}>
						CADASTRE JÁ E ACESSE NOSSA FERRAMENTA
					</Typography>
				</Typography>
				
				<div>
					<center><img style={{ margin: "0 auto", width: "70%" }} src={logo} alt="Logocadastro" /></center>
				</div>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSignUp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form className={classes.form}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Field
										as={TextField}
										autoComplete="name"
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										fullWidth
										id="name"
										label="Nome da Empresa"
									/>
								</Grid>

								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										id="email"
										label={i18n.t("signup.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										autoComplete="email"
										required
									/>
								</Grid>
								
								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										id="phone"
										label="Telefone com (DDD)"
										name="phone"
										error={touched.phone && Boolean(errors.phone)}
										helperText={touched.phone && errors.phone}
										autoComplete="phone"
										required
									/>
								</Grid>

								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										name="password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										label={i18n.t("signup.form.password")}
										type="password"
										id="password"
										autoComplete="current-password"
										required
									/>
								</Grid>
								<Grid item xs={12}>
									<Field
										as={TextField}
										variant="outlined"
										fullWidth
										name="confirmPassword"
										error={touched.confirmPassword && Boolean(errors.confirmPassword)}
										helperText={touched.confirmPassword && errors.confirmPassword}
										label={i18n.t("signup.form.confirmPassword")}
										type="password"
										id="confirmPassword"
										required
									/>
								</Grid>
							</Grid>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
								className={classes.submit}
							>
								{i18n.t("signup.buttons.submit")}
							</Button>
							<Grid container justify="flex-end">
								<Grid item>
									<Link
										href="#"
										variant="body2"
										component={RouterLink}
										to="/login"
									>
										{i18n.t("signup.buttons.login")}
									</Link>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</div>
			<Box mt={5}>{/* <Copyright /> */}</Box>
		</Container>
	);
};

export default SignUp;
