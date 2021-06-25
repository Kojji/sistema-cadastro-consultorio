import APIError from '../helpers/APIError';
import db from '../models';
import axios from 'axios';
import { Op } from 'sequelize';

const { Patient,
  sequelize 
} = db;

// Get patient form
const getPostalCode = async (req, res) => {
  const { postalCode } = req.params
  try {
    if (!postalCode) {
      throw new APIError("CEP inválido, digite novamente.");
    }

    let c = JSON.parse(JSON.stringify(postalCode));

    c = c.replace(/\D/g, "");

    // Expressão regular para validar o CEP.
    let validacep = /^[0-9]{8}$/;
    // Valida o formato do CEP.
    if (!validacep.test(c) || c === "") {
      if (c !== "") {
        throw new APIError("CEP Inválido, digite novamente.");
      }
    }

    const getCEP = await axios.get("https://viacep.com.br/ws/" + c + "/json/")

    if (!getCEP) {
      throw new APIError("Serviço de busca de CEP indisponível.");
    }

    if ("erro" in getCEP.data) {
      throw new APIError("CEP não encontrado.");
    }

    return res.json({
      success: true,
      data: getCEP.data,
      message: "CEP encontrado!"
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

export default { getPostalCode }