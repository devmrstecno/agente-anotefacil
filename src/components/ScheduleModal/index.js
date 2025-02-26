import React, { useState, useEffect, useContext, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  FormControl,
  Grid,
  IconButton,
  Box,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";
import { isArray, capitalize } from "lodash";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import AttachFile from "@material-ui/icons/AttachFile";
import { head } from "lodash";
import ConfirmationModal from "../ConfirmationModal";
import MessageVariablesPicker from "../MessageVariablesPicker";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const ScheduleSchema = Yup.object().shape({
  body: Yup.string().min(5, "Mensagem muito curta").required("Obrigatório"),
  contactId: Yup.number().required("Obrigatório"),
  sendAt: Yup.string().required("Obrigatório"),
  recurrenceInterval: Yup.number().when("isRecurring", {
    is: true,
    then: Yup.number().required("Selecione um intervalo de recorrência"),
  }),
  recurrenceDuration: Yup.number().when("isRecurring", {
    is: true,
    then: Yup.number().required("Selecione uma duração de recorrência"),
  }),
});

const ScheduleModal = ({
  open,
  onClose,
  scheduleId,
  contactId,
  cleanContact,
  reload,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const initialState = {
    body: "",
    contactId: "",
    sendAt: moment().add(1, "hour").format("YYYY-MM-DDTHH:mm"),
    sentAt: "",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceDuration: 1, 
  };

  const initialContact = {
    id: "",
    name: "",
  };

  const [schedule, setSchedule] = useState(initialState);
  const [currentContact, setCurrentContact] = useState(initialContact);
  const [currentTag, setCurrentTag] = useState();
  const [contacts, setContacts] = useState([initialContact]);
  const [attachment, setAttachment] = useState(null);
  const attachmentFile = useRef(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const messageInputRef = useRef();
  const [tagLists, setTagLists] = useState([]);
  const [queueLists, setQueueLists] = useState([]);

  useEffect(() => {
    if (contactId && contacts.length) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        setCurrentContact(contact);
      }
    }
  }, [contactId, contacts]);

  useEffect(() => {
    const { companyId } = user;
    if (open) {
      try {
        (async () => {
          const { data: contactList } = await api.get("/contacts/list", {
            params: { companyId: companyId },
          });
          let customList = contactList.map((c) => ({ id: c.id, name: c.name }));
          if (isArray(customList)) {
            setContacts([{ id: "", name: "" }, ...customList]);
          }
          if (contactId) {
            setSchedule((prevState) => {
              return { ...prevState, contactId };
            });
          }

          if (!scheduleId) return;

          const { data } = await api.get(`/schedules/${scheduleId}`);
          setSchedule((prevState) => {
            return {
              ...prevState,
              ...data,
              sendAt: moment(data.sendAt).format("YYYY-MM-DDTHH:mm"),
              isRecurring: data.isRecurring || false,
              recurrenceInterval: data.recurrenceInterval || 1,
              recurrenceDuration: data.recurrenceDuration || 1,
            };
          });
          setCurrentTag(data.tags);
          setCurrentContact(data.contact);
        })();
      } catch (err) {
        toastError(err);
      }
      api
        .get(`/tags`, { params: { companyId } })
        .then(({ data }) => {
          const fetchedTags = data.tags;
          const formattedTagLists = fetchedTags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }));
          setTagLists(formattedTagLists);
        })
        .catch((error) => {
          console.error("Error retrieving tags:", error);
        });
      api
        .get(`/queue`, { params: { companyId } })
        .then(({ data }) => {
          const fetchedQueue = data;
          const formattedQueueLists = fetchedQueue.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }));
          setQueueLists(formattedQueueLists);
        })
        .catch((error) => {
          console.error("Error retrieving queue:", error);
        });
    }
  }, [scheduleId, contactId, open, user]);

  const handleClose = () => {
    onClose();
    setAttachment(null);
    setSchedule(initialState);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveSchedule = async (values) => {
    const scheduleData = { ...values, userId: user.id };
    try {
      if (scheduleId) {
        await api.put(`/schedules/${scheduleId}`, scheduleData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/schedules/${scheduleId}/media-upload`, formData);
        }
      } else {
        const { data } = await api.post("/schedules", scheduleData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/schedules/${data.id}/media-upload`, formData);
        }
      }
      toast.success(i18n.t("scheduleModal.success"));
      if (typeof reload == "function") {
        reload();
      }
      if (contactId) {
        if (typeof cleanContact === "function") {
          cleanContact();
          history.push("/schedules");
        }
      }
    } catch (err) {
      toastError(err);
    }
    setCurrentContact(initialContact);
    setSchedule(initialState);
    handleClose();
  };

  const handleClickMsgVar = async (msgVar, setValueFunc) => {
    const el = messageInputRef.current;
    const firstHalfText = el.value.substring(0, el.selectionStart);
    const secondHalfText = el.value.substring(el.selectionEnd);
    const newCursorPos = el.selectionStart + msgVar.length;

    setValueFunc("body", `${firstHalfText}${msgVar}${secondHalfText}`);

    await new Promise((r) => setTimeout(r, 100));
    messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (schedule.mediaPath) {
      await api.delete(`/schedules/${schedule.id}/media-upload`);
      setSchedule((prev) => ({
        ...prev,
        mediaPath: null,
      }));
      toast.success(i18n.t("scheduleModal.toasts.deleted"));
      if (typeof reload == "function") {
        reload();
      }
    }
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("scheduleModal.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("scheduleModal.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {schedule.status === "ERRO"
            ? "Erro de Envio"
            : `Mensagem ${capitalize(schedule.status)}`}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>
        <Formik
          initialValues={schedule}
          enableReinitialize={true}
          validationSchema={ScheduleSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveSchedule(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <FormControl variant="outlined" fullWidth>
                    <Autocomplete
                      fullWidth
                      value={currentContact}
                      options={contacts}
                      onChange={(e, contact) => {
                        const contactId = contact ? contact.id : "";
                        setSchedule({ ...schedule, contactId });
                        setCurrentContact(contact ? contact : initialContact);
                      }}
                      getOptionLabel={(option) => option.name}
                      getOptionSelected={(option, value) => {
                        return value.id === option.id;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="Contato"
                        />
                      )}
                    />
                  </FormControl>
                </div>
                <br />
                <div className={classes.multFieldLine}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="tagList-selection-label">
                      {i18n.t("campaigns.dialog.form.tagList")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("campaigns.dialog.form.tagList")}
                      placeholder={i18n.t("campaigns.dialog.form.tagList")}
                      labelId="tagList-selection-label"
                      id="tagListId"
                      name="tagListId"
                      error={touched.tagListId && Boolean(errors.tagListId)}
                    >
                      <MenuItem value="">Nenhuma</MenuItem>
                      {Array.isArray(tagLists) &&
                        tagLists.map((tagList) => (
                          <MenuItem key={tagList.id} value={tagList.id}>
                            {tagList.name}
                          </MenuItem>
                        ))}
                    </Field>
                  </FormControl>
                </div>
                <br />
                <div className={classes.multFieldLine}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel id="queueList-selection-label">
                      {i18n.t("campaigns.dialog.form.queueList")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={"Lista de Filas"}
                      placeholder={"Lista de Filas"}
                      labelId="queueList-selection-label"
                      id="queueListId"
                      name="queueListId"
                      error={touched.queueListId && Boolean(errors.queueListId)}
                    >
                      <MenuItem value="">Nenhuma</MenuItem>
                      {Array.isArray(queueLists) &&
                        queueLists.map((queueList) => (
                          <MenuItem key={queueList.id} value={queueList.id}>
                            {queueList.name}
                          </MenuItem>
                        ))}
                    </Field>
                  </FormControl>
                </div>
                <br />
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    rows={9}
                    multiline={true}
                    label={i18n.t("scheduleModal.form.body")}
                    name="body"
                    inputRef={messageInputRef}
                    error={touched.body && Boolean(errors.body)}
                    helperText={touched.body && errors.body}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <br />
                <Grid item>
                  <MessageVariablesPicker
                    disabled={isSubmitting}
                    onClick={(value) => handleClickMsgVar(value, setFieldValue)}
                  />
                </Grid>
                <br />
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("scheduleModal.form.sendAt")}
                    type="datetime-local"
                    name="sendAt"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={touched.sendAt && Boolean(errors.sendAt)}
                    helperText={touched.sendAt && errors.sendAt}
                    variant="outlined"
                    fullWidth
                  />
                </div>
                <br />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.isRecurring}
                      onChange={(e) => setFieldValue("isRecurring", e.target.checked)}
                      name="isRecurring"
                      color="primary"
                    />
                  }
                  label="Agendar Recorrente"
                />
                {values.isRecurring && (
                  <>
                    <div className={classes.multFieldLine}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel id="recurrence-interval-label">Frequência da Recorrência</InputLabel>
                        <Field
                          as={Select}
                          labelId="recurrence-interval-label"
                          id="recurrence-interval"
                          name="recurrenceInterval"
                          value={values.recurrenceInterval}
                          onChange={(e) => setFieldValue("recurrenceInterval", e.target.value)}
                          label="Frequência da Recorrência"
                        >
                          <MenuItem value={1}>A cada 1 dia</MenuItem>
                          <MenuItem value={3}>A cada 3 dias</MenuItem>
                          <MenuItem value={7}>A cada 7 dias</MenuItem>
                          <MenuItem value={15}>A cada 15 dias</MenuItem>
                          <MenuItem value={30}>A cada 30 dias</MenuItem>
                        </Field>
                      </FormControl>
                    </div>
                    <br />
                    <div className={classes.multFieldLine}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel id="recurrence-duration-label">Duração da Recorrência</InputLabel>
                        <Field
                          as={Select}
                          labelId="recurrence-duration-label"
                          id="recurrence-duration"
                          name="recurrenceDuration"
                          value={values.recurrenceDuration}
                          onChange={(e) => setFieldValue("recurrenceDuration", e.target.value)}
                          label="Duração da Recorrência"
                        >
                          <MenuItem value={1}>1 mês</MenuItem>
                          <MenuItem value={2}>2 meses</MenuItem>
                          <MenuItem value={6}>6 meses</MenuItem>
                          <MenuItem value={12}>1 ano</MenuItem>
                        </Field>
                      </FormControl>
                    </div>
                  </>
                )}
                {(schedule.mediaPath || attachment) && (
                  <Grid xs={12} item>
                    <Button startIcon={<AttachFile />}>
                      {attachment ? attachment.name : schedule.mediaName}
                    </Button>
                    <IconButton
                      onClick={() => setConfirmationOpen(true)}
                      color="secondary"
                    >
                      <DeleteOutline color="secondary" />
                    </IconButton>
                  </Grid>
                )}
              </DialogContent>
              <DialogActions>
                {!attachment && !schedule.mediaPath && (
                  <Button
                    color="primary"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    variant="outlined"
                  >
                    {i18n.t("quickMessages.buttons.attach")}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("scheduleModal.buttons.cancel")}
                </Button>
                {(schedule.sentAt === null || schedule.sentAt === "") && (
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                    className={classes.btnWrapper}
                  >
                    {scheduleId
                      ? `${i18n.t("scheduleModal.buttons.okEdit")}`
                      : `${i18n.t("scheduleModal.buttons.okAdd")}`}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </Button>
                )}
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default ScheduleModal;
