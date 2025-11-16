import axios from "axios";

const HOSTURL = process.env.NEXT_PUBLIC_HOSTURL;

export const getDataAPI = async (url, token) => {
    return await axios.get(`${HOSTURL}${url}`, {
        headers: {
            Authorization: token,
        },
    });
};

export const postDataAPI = async (
    url,
    customData,
    credentials,
    token,
    ctype
) => {
    return await axios.post(
        `${HOSTURL}${url}`, // URL
        customData,
        {
            headers: {
                Authorization: token,
                "Content-Type": ctype,
            },
            withCredentials: credentials,
        }
    );
};