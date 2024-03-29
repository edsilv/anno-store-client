import React, { Component, ErrorInfo } from "react";
import { QueryType } from "../Enums";

interface Props {
  annotation: string | null;
  endpoint: string | null;
  id: string | null;
  onQueryResult: (queryResult: string) => void;
  queryTimestamp: string | null;
  queryType: QueryType;
  secret: string | null;
}

interface State {
  annotation: string | null;
  endpoint: string | null;
  error: string | null;
  id: string | null;
  queryResult: string | null;
  queryTimestamp: string | null;
  queryType: QueryType;
  queryUrl: string | null;
  secret: string | null;
}

export default class AnnoStoreQuery extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      annotation: null,
      endpoint: null,
      error: null,
      id: null,
      queryResult: null,
      queryTimestamp: null,
      queryType: QueryType.NONE,
      queryUrl: null,
      secret: null
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    // Store prevQuery in state so we can compare when props change.
    // Clear out any previously-loaded result data (so we don't render stale stuff).
    if (nextProps.queryTimestamp !== prevState.queryTimestamp) {
      return {
        queryTimestamp: nextProps.queryTimestamp,
        endpoint: nextProps.endpoint,
        queryType: nextProps.queryType,
        secret: nextProps.secret,
        annotation: nextProps.annotation,
        queryResult: null,
        error: null
      };
    }

    // No state update necessary
    return null;
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error: error };
  }

  componentDidMount() {
    // It's preferable in most cases to wait until after mounting to load data.
    // See below for a bit more context...
    this.queryEndpoint();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { error, queryResult } = this.state;

    if (error === null && queryResult === null) {
      // At this point, we're in the "commit" phase, so it's safe to load the new data.
      this.queryEndpoint();
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // You can also log the error to an error reporting service
    //console.log(error);
  }

  renderDebug() {
    const { queryUrl } = this.state;
    return <div>query: {queryUrl}</div>;
  }

  render() {
    const { queryResult, error } = this.state;

    if (queryResult) {
      return (
        <div>
          {this.renderDebug()}
          <div>query result: {queryResult}</div>
        </div>
      );
    } else if (error) {
      return (
        <div>
          {this.renderDebug()}
          <div>query error: {error}</div>
        </div>
      );
    } else {
      return (
        <div>
          {this.renderDebug()}
          <div>no query result</div>
        </div>
      );
    }
  }

  createGETParams(params: string[]) {
    return Object.keys(params).reduce((acc, val) => {
      if (!params[val]) {
        return acc;
      }
      return `${acc}${(acc && "&") || "?"}${val}=${params[val]}`;
    }, "");
  }

  queryEndpoint() {
    // Cancel any in-progress requests
    // Load new data and update result
    const {
      queryTimestamp,
      endpoint,
      queryType,
      secret,
      annotation
    } = this.state;
    const { onQueryResult } = this.props;

    // if (endpoint && secret) {
    //   setTimeout(() => {
    //     //throw new Error("test fail");
    //     const queryResult = "test fail";
    //     this.setState({
    //       queryResult: queryResult
    //     });
    //     onQueryResult(queryResult);
    //   }, 1000);
    // }

    if (!queryTimestamp) {
      this.setState({
        queryResult: "waiting for queries"
      });
      return;
    }

    if (!endpoint) {
      this.setState({
        error: "no endpoint specified"
      });
      return;
    }

    if (!secret) {
      this.setState({
        error: "no secret specified"
      });
      return;
    }

    let data = {
      s: secret,
      annotation: annotation ? encodeURIComponent(annotation) : null
    };

    //let url = `${endpoint}${queryType}${this.createGETParams(data)}`;
    //this.GETData(url);

    let url = `${endpoint}${queryType}`;

    this.POSTData(url, data).then(
      queryResult => {
        this.setState({
          queryUrl: url,
          queryResult: JSON.stringify(queryResult)
        });
        onQueryResult(queryResult);
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      error => {
        this.setState({
          queryUrl: url,
          error: error.message
        });
        onQueryResult(error);
      }
    );
  }

  GETData(url = ``) {
    return fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "omit", // include, *same-origin, omit
      headers: {
        //"Content-Type": "application/json"
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer" // no-referrer, *client
    }).then(response => response.json()); // parses response to JSON
  }

  POSTData(url = ``, data = {}) {
    // Default options are marked with *
    return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "omit", // include, *same-origin, omit
      headers: {
        //"Content-Type": "application/json",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(response => response.json()); // parses response to JSON
  }
}
