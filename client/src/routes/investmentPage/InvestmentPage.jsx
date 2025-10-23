"use client";

import React, { useState } from "react";
import axios from "axios";
import "./investmentPage.scss";


const InvestmentPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    type: "",
    address: "",
    size: "",
    goal: "",
  });

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnalysis("");

    try {
      const res = await axios.post("http://localhost:8800/api/ai/invest", formData);

      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error(err);
      setAnalysis("Failed to generate investment insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="investment-page">
      <h2>Generate Investment Insights</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Property Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="type"
          placeholder="Type (buy/rent)"
          value={formData.type}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="size"
          placeholder="Size (sqft)"
          value={formData.size}
          onChange={handleChange}
        />
        <input
          type="text"
          name="goal"
          placeholder="Investment Goal"
          value={formData.goal}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Insights"}
        </button>
      </form>

      {analysis && (
        <div className="investment-result">
          <h3>Investment Analysis</h3>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default InvestmentPage;
