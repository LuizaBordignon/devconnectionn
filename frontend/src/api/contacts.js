import client from './client';

export const getContacts = () => client.get('/contacts').then(r => r.data);
export const createContact = (data) => client.post('/contacts', data).then(r => r.data);
export const deleteContact = (id) => client.delete(`/contacts/${id}`);
export const updateContact = (id, data) => client.put(`/contacts/${id}`, data).then(r => r.data);
export const getContactHistory = (id) => client.get(`/contacts/${id}/historico`).then(r => r.data);