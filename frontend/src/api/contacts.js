import client from './client';

export const getContacts = () => client.get('/contacts').then(r => r.data);
export const createContact = (data) => client.post('/contacts', data).then(r => r.data);
export const deleteContact = (id) => client.delete(`/contacts/${id}`);