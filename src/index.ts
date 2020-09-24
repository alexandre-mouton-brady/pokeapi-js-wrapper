import { Store, get, set } from "idb-keyval";
import endpoints from "./endpoints.json";
import rootEndpoints from "./rootEndpoints.json";
import axios from "redaxios";

export class Pokedex {
  private store = new Store("pokeapi-js-wrapper", "pokeapi-js-wrapper");
  private config: Config = {
    // Pokedex config
    cache: true,
    timeout: 20 * 1_000,
    baseUrl: "https://pokeapi.co/api/v2/",

    // Endpoint configuration
    offset: 0,
    limit: 100_000,
  };

  constructor(config: Partial<Config> = {}) {
    this.config = { ...this.config, ...config };

    for (const [endpointName, endpoint] of endpoints) {
      this[endpointName] = (input: number | string | (number | string)[]) => {
        if (!input) return;
        if (["number", "string"].includes(typeof input)) {
          return this.loadResource(`${endpoint}/${input}/`);
        } else if (Array.isArray(input)) {
          return Promise.all(this.mapResources(endpoint, input));
        }
      };
    }

    for (const [rootEndpointName, endpoint] of rootEndpoints) {
      this[rootEndpointName] = (config: Partial<Config> = {}) => {
        const limit = "limit" in config ? config.limit : this.config.limit;
        const offset = "offset" in config ? config.offset : this.config.offset;

        return this.loadResource(`${endpoint}?limit=${limit}&offset=${offset}`);
      };
    }
  }

  public resource(path: string | unknown[]) {
    if (typeof path === "string") {
      return this.loadResource(path);
    } else if (Array.isArray(path)) {
      return Promise.all(path.map((p) => this.loadResource(p)));
    }

    throw new Error("String or Array is required");
  }

  private mapResources(endpoint: string, input: unknown[]) {
    return input.map((res) => this.loadResource(`${endpoint}/${res}/`));
  }

  private loadResource(url: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const value = await get(url, this.store);

        if ([null, undefined].includes(value)) {
          this.loadUrl(url)
            .then((res) => resolve(res))
            .catch((err) => reject(err));
        } else resolve(value);
      } catch {
        this.loadUrl(url)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      }
    });
  }

  private loadUrl(url: string) {
    return new Promise((resolve, reject) => {
      const options = {
        baseURL: this.config.baseUrl,
        timeout: this.config.timeout,
      };
      axios
        .get(url, options)
        .then((response) => {
          if (response.status >= 400) {
            reject(response);
          } else {
            if (this.config.cache) set(url, response.data, this.store);
            resolve(response.data);
          }
        })
        .catch(reject);
    });
  }
}

interface Config {
  baseUrl: string;
  cache: boolean;
  timeout: number; // 5s
  offset: number;
  limit: number;
}
