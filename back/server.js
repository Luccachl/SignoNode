require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no banco de dados:", err.message);
    process.exit(1);
  }
  console.log("Conectado ao banco de dados MySQL.");
});

app.get("/polls", (req, res) => {
  db.query("SELECT * FROM polls", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/polls/:id", (req, res) => {
  const pollId = req.params.id;
  db.query("SELECT * FROM polls WHERE id = ?", [pollId], (err, polls) => {
    if (err) return res.status(500).json({ error: err.message });
    if (polls.length === 0) return res.status(404).json({ error: "Enquete não encontrada" });

    db.query("SELECT * FROM options WHERE poll_id = ?", [pollId], (err, options) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...polls[0], options });
    });
  });
});

app.post("/polls", (req, res) => {
    const { title, end_date, options } = req.body;
  
    const endDate = new Date(end_date); 
    const endDateFormatted = new Date(
      endDate.getTime() - endDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    if (!title || !endDateFormatted || options.length < 3) {
      return res.status(400).json({ error: "Dados inválidos ou faltando." });
    }
  
    
    const start_date = new Date();
    const localStartDate = new Date(start_date.getTime() - start_date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); 
  
    db.query(
      "INSERT INTO polls (title, start_date, end_date) VALUES (?, ?, ?)",
      [title, localStartDate, endDateFormatted],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
  
        const pollId = result.insertId;
        const values = options.map((option) => [pollId, option]);
  
        db.query(
          "INSERT INTO options (poll_id, option_text) VALUES ?",
          [values],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: pollId });
          }
        );
      }
    );
  });
  
  
app.put("/polls/:id", (req, res) => {
  const pollId = req.params.id;
  const { title, end_date, options } = req.body;

  db.query(
    "UPDATE polls SET title = ?, end_date = ? WHERE id = ?",
    [title, end_date, pollId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query("DELETE FROM options WHERE poll_id = ?", [pollId], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const values = options.map((option) => [pollId, option]);
        db.query(
          "INSERT INTO options (poll_id, option_text) VALUES ?",
          [values],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Enquete atualizada com sucesso" });
          }
        );
      });
    }
  );
});

app.delete("/polls/:id", (req, res) => {
  const pollId = req.params.id;
  db.query("DELETE FROM polls WHERE id = ?", [pollId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Enquete removida com sucesso" });
  });
});

// Votação
app.post("/vote", (req, res) => {
  const { optionId } = req.body;

  db.query(
    "UPDATE options SET votes = votes + 1 WHERE id = ?",
    [optionId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Voto registrado com sucesso" });
    }
  );
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
