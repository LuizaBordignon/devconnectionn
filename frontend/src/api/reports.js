import client from './client';

export const getPeriodReport = (startDate, endDate) =>
  client.get('/relatorio/periodo', { params: { start_date: startDate, end_date: endDate } }).then(r => r.data);

export const requestClosure = (startDate, endDate) =>
  client.post('/relatorio/fechamento', { start_date: startDate, end_date: endDate }).then(r => r.data);

export const getClosure = (id) =>
  client.get(`/relatorio/fechamento/${id}`).then(r => r.data);