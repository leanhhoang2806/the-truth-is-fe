import axios from "axios";

const BASE_URL = "https://app.popo24.com"
const BASE_UTL = "http://localhost:8000"

const postEmailCollection = async (accessToken) => {
  const url = `${BASE_URL}/user_email`;
  return postRequestWithToken(url, {}, accessToken);
};

const postLegalEvaluate = async (answer, accessToken) => {
  const url = `${BASE_URL}/legal_evaluation`;
  const payload = {
    answer,
  };

  return postRequestWithToken(url, payload, accessToken);
};
const postEvaluate = async (email, context, response, accessToken) => {
  const url = `${BASE_URL}/evaluate`;
  const payload = {
    email,
    question: context,
    answer: response,
  };
  return postRequestWithToken(url, payload, accessToken);
};

const postAnyMetric = async (limit, accessToken) => {
  const url = `${BASE_URL}/alert`;
  const payload = {
    limit: [parseInt(limit)],
    alertType: "Any",
  };

  return postRequestWithToken(url, payload, accessToken);
};

const postSpecificMetric = async (limit, metric, accessToken) => {
  const url = `${BASE_URL}/alert`;
  const payload = {
    limit,
    metrics: metric,
    alertType: "Combined",
  };

  return postRequestWithToken(url, payload, accessToken);
};

const getEvaluate = async (token) => {
  const url = `${BASE_URL}/evaluate`;
  return getWithToken(url, token);
};

const postEvaluateWithToken = async (email, text, accessToken) => {
  const url = `${BASE_URL}/evaluate-with-token`;
  const payload = {
    email,
    text,
  };
  return postRequestWithToken(url, payload, accessToken);
};

const getAlert = async (token) => {
  const url = `${BASE_URL}/alert`;

  return getWithToken(url, token);
};

const deleteAlert = async (documentId, accessToken) => {
  const url = `${BASE_URL}/alert/${documentId}`;
  const response = await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

const getWithToken = async (url, accessToken) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response) {
      return response.data;
    }
    return 0;
  } catch (error) {
    if (error.response && error.response.status === 500) {
      window.location.href = "/error-page";
    } else {
      return Promise.reject(error.response.data.detail);
    }
  }
};

const postRequestWithToken = async (url, payload, accessToken) => {
  try {
    const response = await axios.post(
      url,
      { ...payload },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 500) {
      window.location.href = "/error-page";
    } else {
      return Promise.reject(error.response.data.detail);
    }
  }
};

export {
  postEvaluate,
  postEvaluateWithToken,
  getEvaluate,
  getAlert,
  postAnyMetric,
  deleteAlert,
  postSpecificMetric,
  postEmailCollection,
  postLegalEvaluate,
};
