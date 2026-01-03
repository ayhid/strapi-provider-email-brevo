import { useFetchClient as useStrapiFetchClient } from '@strapi/strapi/admin';

export const useFetchClient = () => {
  const { get, put, post, del } = useStrapiFetchClient();

  return {
    get,
    put,
    post,
    del,
  };
};
