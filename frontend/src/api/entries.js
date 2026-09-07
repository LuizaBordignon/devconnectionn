import client from './client';

export const deleteEntry = (id) => client.delete(`/entries/${id}`);
export const getEntries = () => client.get('/entries').then(r => r.data);
export const createEntry = (data) => client.post('/entries', data).then(r => r.data);
export const liquidarEntry = (id, paidAmount) =>
  client.post(`/entries/${id}/liquidar`, { paid_amount: paidAmount }).then(r => r.data);