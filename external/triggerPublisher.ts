import axios from 'axios';
import { PUBLISHER_TRIGGER_URL } from "../shared/projectSettings";

export const triggerPublisher = async () =>
    await axios.get(PUBLISHER_TRIGGER_URL);
