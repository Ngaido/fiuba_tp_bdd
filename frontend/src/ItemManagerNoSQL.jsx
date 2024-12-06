import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api/products";  // URL of your backend for products (MongoDB)

const ItemManagerNoSQL = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    attributes: [], // Array of attribute objects with key and value
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null); // To display errors

  // Fetch all items from the backend
  const fetchItems = async () => {
    try {
      const response = await axios.get(API_URL);
      setItems(response.data);
    } catch (err) {
      setError("Error fetching items.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      setForm({ name: "", description: "", price: "", stock: "", attributes: [] });
      setEditingId(null);
      fetchItems();
    } catch (err) {
      setError("Error submitting the form.");
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item._id); // Use _id instead of id
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchItems();
    } catch (err) {
      setError("Error deleting the item.");
      console.error(err);
    }
  };

  // Handle changes to attribute key and value
  const handleAttributeChange = (e, index, type) => {
    const updatedAttributes = [...form.attributes];
    updatedAttributes[index][type] = e.target.value;
    setForm({
      ...form,
      attributes: updatedAttributes,
    });
  };

  // Add a new attribute (key-value pair)
  const handleAddNewAttribute = () => {
    setForm({
      ...form,
      attributes: [...form.attributes, { key: "", value: "" }],
    });
  };

  return (
    <div className="container">
      <h1>Item Manager (NoSQL)</h1>
      {error && <div className="error">{error}</div>}
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
        <div>
          <label>Atributos adicionales</label>
          <button type="button" onClick={handleAddNewAttribute}>+</button>
          {form.attributes.map((attribute, index) => (
            <div key={index} className="attribute">
              <input
                type="text"
                placeholder="Atributo (ej. color)"
                value={attribute.key}
                onChange={(e) => handleAttributeChange(e, index, "key")}
              />
              <input
                type="text"
                placeholder="Valor"
                value={attribute.value}
                onChange={(e) => handleAttributeChange(e, index, "value")}
              />
            </div>
          ))}
        </div>
        <button type="submit">{editingId ? "Update" : "Create"}</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item._id}>
            {item.name} - ${item.price} ({item.stock} in stock)
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item._id)}>Delete</button>
            <div>
              {item.attributes && item.attributes.length > 0 && (
                <div>
                  <h3>Attributes:</h3>
                  <ul>
                    {item.attributes.map((attribute, index) => (
                      <li key={index}>{attribute.key}: {attribute.value}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemManagerNoSQL;
