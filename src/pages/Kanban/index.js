import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from "react-trello";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import TicketMessagesDialog from "../../components/TicketMessagesDialog";
import useQueues from "../../hooks/useQueue";
import { format } from "date-fns";
import KanbanSkeleton from "./KanbanSkeleton";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    height: "94%",
    overflowY: "auto",
  },
  button: {
    background: "#10a110",
    border: "none",
    padding: "10px",
    color: "white",
    fontWeight: "bold",
    borderRadius: "5px",
  },
}));
const styles = {
  label: {
    whiteSpace: "wrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  title: {
    fontWeight: "bold",
    whiteSpace: "wrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minHeight: "35px",
    display: "flex",
    alignContent: "center",
  },
};

const Kanban = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { queueIds } = useQueues();

  const [file, setFile] = useState({
    lanes: [],
  });
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [ticketSelected, setTicketSelected] = useState(null);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [lanePages, setLanePages] = useState({});

  const jsonString = useMemo(
    () => user.queues.map((queue) => queue.UserQueue.queueId),
    [user.queues]
  );

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      setTags(response.data.lista || []);
    } catch (error) {
      console.error("Erro ao carregar tags:", error);
    }
  };

  const createCards = useCallback((tickets, filterFn = () => true) => {
    if (!Array.isArray(tickets)) return [];

    const sortedTickets = [...tickets].sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return dateB - dateA;
    });

    const filteredTickets =
      typeof filterFn === "function"
        ? sortedTickets.filter(filterFn)
        : sortedTickets;

    return filteredTickets.map((ticket) => {
      const formattedDate = format(
        new Date(ticket.updatedAt),
        "dd/MM/yyyy HH:mm"
      );

      return {
        id: ticket.id.toString(),
        label: <span style={styles.label}>Ticket nº {ticket.id}</span>,
        title: <span style={styles.title}>{ticket.contact.name}</span>,
        description: (
          <div>
            <p>
              {ticket.contact.number}
              <br />
              {ticket.lastMessage}
              <br />
              {formattedDate}
              <br />
            </p>
            <Button
              color="primary"
              variant="contained"
              onClick={() => handleCardClick(ticket)}
            >
              Ver Ticket
            </Button>
          </div>
        ),
        draggable: true,
      };
    });
  }, []);

  const fetchTickets = useCallback(
    async (page, tagId = null) => {
      const params = {
        queueIds: JSON.stringify(
          user.profile === "admin" ? queueIds : jsonString
        ),
        pageNumber: page,
        showAll: user.profile === "admin",
        tags: tagId ? JSON.stringify([tagId]) : JSON.stringify([]),
      };

      try {
        const { data } = await api.get("/ticket/kanban", { params });

        return {
          tickets: Array.isArray(data.tickets) ? data.tickets : [],
          hasMore: !!data.hasMore,
        };
      } catch (error) {
        console.error("Erro ao carregar tickets:", error);
        return { tickets: [], hasMore: false };
      }
    },
    [user.profile, queueIds, jsonString]
  );
  const popularCards = useCallback(async () => {
    const lanes = [];

    const openTickets = tickets.filter((ticket) => ticket.tags.length === 0);
    lanes.push({
      id: "lane0",
      title: i18n.t("Em aberto"),
      label: `Tickets: ${openTickets.length}`,
      currentPage: 1,
      hasMore: true,
      cards: createCards(openTickets),
    });

    try {
      const tagPromises = tags.map(async (tag) => {
        const { tickets: taggedTickets, hasMore } = await fetchTickets(
          1,
          tag.id
        );

        return {
          id: tag.id.toString(),
          title: <span style={styles.title}>{tag.name}</span>,
          label: `Tickets: ${taggedTickets.length}`,
          currentPage: 1,
          hasMore,
          cards: createCards(taggedTickets),
          style: { backgroundColor: tag.color, color: "white" },
        };
      });

      const tagLanes = (await Promise.all(tagPromises)).filter(Boolean);
      lanes.push(...tagLanes);

      setFile({ lanes });
    } catch (error) {
      console.error("Erro ao popular lanes:", error);
    }
  }, [tickets, tags, createCards, fetchTickets]);

  const shouldFetchData = useMemo(() => queueIds.length > 0, [queueIds]);
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!shouldFetchData) return;

      setLoading(true);
      try {
        await fetchTags();
        const { tickets: openTickets } = await fetchTickets(1);
        setTickets(openTickets || []);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [shouldFetchData, fetchTickets]);

  useEffect(() => {
    if (tickets.length > 0 || tags.length > 0) {
      popularCards();
    }
  }, [tickets, tags, popularCards]);

  useEffect(() => {
    if (file.lanes.length > 0) {
      const initialPages = file.lanes.reduce((acc, lane) => {
        acc[lane.id] = 1;
        return acc;
      }, {});
      setLanePages(initialPages);
    }
  }, []);

  const onLaneScroll = async (requestedPage, laneId) => {
    const currentPage = lanePages[laneId] || 1;

    const lane = file.lanes.find((l) => l.id === laneId);

    if (!lane || isFetching || !lane.hasMore) return;

    setIsFetching(true);

    try {
      const nextPage = currentPage + 1;
      const { tickets: newTickets, hasMore } = await fetchTickets(
        nextPage,
        laneId === "lane0" ? null : parseInt(laneId)
      );

      setLanePages((prevPages) => ({
        ...prevPages,
        [laneId]: nextPage,
      }));

      setFile((prevFile) => ({
        ...prevFile,
        lanes: prevFile.lanes.map((l) =>
          l.id === laneId
            ? { ...l, cards: [...l.cards, ...createCards(newTickets)], hasMore }
            : l
        ),
      }));
    } catch (error) {
      console.error("Erro ao carregar mais dados:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleCardClick = (ticket) => {
    setTicketSelected(ticket);
    setOpenTicketMessageDialog(true);
  };
  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      console.log(`Removendo todas as tags do ticket ${targetLaneId}`);
      await api.delete(`/ticket-tags/${targetLaneId}`);

      if (sourceLaneId !== "lane0") {
        console.log(
          `Adicionando tag ${sourceLaneId} ao ticket ${targetLaneId}`
        );
        await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      } else {
        console.log(`Ticket ${targetLaneId} agora está sem tag.`);
      }
    } catch (error) {
      toast.error("Erro ao mover ticket.");
      console.error("Erro ao mover ticket:", error);
    } finally {
      toast.success("Ticket movido com sucesso!", { id: "tickets-movido" });
    }
  };

  if (loading) {
    return <KanbanSkeleton />;
  }

  return (
    <div className={classes.root}>
      <TicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticketSelected?.id}
        kabanPage={true}
      />
      <Board
        data={file}
        onCardMoveAcrossLanes={handleCardMove}
        onLaneScroll={onLaneScroll}
        style={{
          backgroundColor: "rgba(252, 252, 252, 0.03)",
          height: "100%",
          overflowY: "auto",
          width: "100%",
        }}
      />
    </div>
  );
};

export default Kanban;
