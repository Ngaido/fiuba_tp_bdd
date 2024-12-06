import React, { useState, useEffect } from "react";
import axios from "axios";
import './ItemManagerSQL.css'; // Import the CSS file

const API_URL = "http://localhost:8000/api/items";

const ItemManager = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchItems = async () => {
    const response = await axios.get(API_URL);
    setItems(response.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, form);
    } else {
      await axios.post(API_URL, form);
    }
    setForm({ name: "", description: "", price: "", stock: "" });
    setEditingId(null);
    fetchItems();
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchItems();
  };

  return (
    <div className="container">
      <h1>Item Manager</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <button type="submit">{editingId ? "Update" : "Create"}</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.name}</strong> - ${item.price} ({item.stock} in stock)
            </div>
            <div>
              <p>{item.description}</p> {/* Display item description here */}
            </div>
            <div>
              <button className="edit" onClick={() => handleEdit(item)}>Edit</button>
              <button className="delete" onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemManager;
