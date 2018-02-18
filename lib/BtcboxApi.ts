import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { DepthResponse, CancelRequest, CancelResponse, ErrorResponse, SendRequest, SendResponse, GetOrderRequest, GetOrderResponse } from './apiTypes';
import * as util from './util';
import * as crypto from 'crypto';
import * as querystring from 'querystring';
import { EventEmitter } from 'events';
import { BalanceRequest, BalanceResponse } from './apiTypes';
import errorMap from './errorMap';

// to avoid a known issue with axios + nock.  https://github.com/axios/axios/issues/305
axios.defaults.adapter = require('axios/lib/adapters/http');

export default class BitbankCcApi extends EventEmitter {
  private readonly baseUrl = 'https://www.btcbox.co.jp';
  private readonly webClient: AxiosInstance;

  constructor(private readonly key: string, private readonly secret: string, private readonly timeout: number = 5000) {
    super();
    this.webClient = axios.create({ baseURL: this.baseUrl, timeout: this.timeout });
  }

  async getDepth(): Promise<DepthResponse> {
    const path = '/api/v1/depth/';
    return await this.publicApiCall<DepthResponse>(path);
  }

  async getBalance(request: BalanceRequest): Promise<BalanceResponse> {
    const path = '/api/v1/balance/';
    return await this.privateApiCall<BalanceRequest, BalanceResponse>(path, request);
  }

  async cancel(request: CancelRequest): Promise<CancelResponse> {
    const path = '/api/v1/trade_cancel/';
    const response = await this.privateApiCall<CancelRequest, CancelResponse | ErrorResponse>(path, request);
    this.checkError(response);
    return response as CancelResponse;
  }

  async send(request: SendRequest): Promise<SendResponse> {
    const path = '/api/v1/trade_add/';
    const response = await this.privateApiCall<SendRequest, SendResponse | ErrorResponse>(path, request);
    this.checkError(response);
    return response as SendResponse;
  }

  async getOrder(request: GetOrderRequest): Promise<GetOrderResponse> {
    const path = '/api/v1/trade_view/';
    return await this.privateApiCall<GetOrderRequest, GetOrderResponse>(path, request);
  }

  private checkError(res) {
    if (!res.result && res.code) {
      const message = errorMap[res.code];
      throw new Error(`${res.code} ${message}`);
    }
  }

  private async privateApiCall<Req, Res>(path: string, request: Req): Promise<Res> {
    let axiosConfig = this.createPostConfig(path, request);
    const requestSummary = {
      url: `${this.webClient.defaults.baseURL}${axiosConfig.url}`,
      method: 'POST',
      headers: axiosConfig
    };
    this.emit('private_request', requestSummary);
    const axiosResponse = await this.webClient.request<Res>(axiosConfig);
    const response = axiosResponse.data;
    this.emit('private_response', response, requestSummary);
    return response;
  }

  private async publicApiCall<Res>(path: string) {
    const url = `${this.webClient.defaults.baseURL}${path}`;
    this.emit('public_request', url);
    const axiosResponse = await this.webClient.get<Res>(path);
    const response = axiosResponse.data;
    this.emit('public_response', response, url);
    return response;
  }

  private createPostConfig(path: string, request: any): AxiosRequestConfig {
    const nonce = util.nonce();
    const body = querystring.stringify({ key: this.key, ...request, nonce });
    const md5secret = crypto
      .createHash('md5')
      .update(this.secret)
      .digest('hex');
    const signature = crypto
      .createHmac('sha256', md5secret)
      .update(body)
      .digest('hex');
    const postData = `${body}&signature=${signature}`;
    return {
      url: path,
      method: 'post',
      data: postData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };
  }
}
