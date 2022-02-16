import axios from 'axios';  //imports axios
const instance = axios.create({
	baseURL: '/',
});
export default instance;  //exports the instance