import React, { Component, ChangeEvent } from "react";
import AnnoStoreQuery from "./AnnoStoreQuery";
import { QueryType } from "../Enums";

interface Props {
  endpoint: string;
}

interface State {
  annotation: string | null;
  endpoint: string | null;
  id: string | null;
  queryResult: string | null;
  queryTimestamp: string | null;
  queryType: QueryType;
  secret: string | null;
}

export default class AnnoStore extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      endpoint: null,
      id: null,
      queryResult: null,
      queryTimestamp: null,
      queryType: QueryType.NONE,
      secret: null,
      annotation: JSON.stringify({
        type: "annotation",
        motivation: "supplementing",
        body: [
          {
            id: "sometarget",
            type: "DataSet",
            value: {
              hello: "world"
            },
            format: "application/json"
          }
        ]
      })
    };

    this.handleSecretChange = this.handleSecretChange.bind(this);
    this.handleQueryTypeChange = this.handleQueryTypeChange.bind(this);
    this.handleAnnotationChange = this.handleAnnotationChange.bind(this);
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    return {
      endpoint: nextProps.endpoint
    };
  }

  handleSecretChange(ev: ChangeEvent<HTMLInputElement>) {
    this.setState({ secret: ev!.target!.value });
  }

  handleQueryTypeChange(ev: ChangeEvent<HTMLSelectElement>) {
    this.setState({ queryType: ev!.target!.value as QueryType });
  }

  handleIdChange(ev: ChangeEvent<HTMLInputElement>) {
    this.setState({ id: ev!.target!.value });
  }

  handleAnnotationChange(ev: ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ annotation: ev!.target!.value });
  }

  renderDebug() {
    const { queryTimestamp } = this.state;
    return <div>query timestamp: {queryTimestamp}</div>;
  }

  render() {
    const {
      annotation,
      endpoint,
      id,
      queryTimestamp,
      queryType,
      secret
    } = this.state;

    if (endpoint) {
      return (
        <div>
          <div>
            <input
              type="text"
              placeholder="secret"
              value={secret ? secret : ""}
              onChange={this.handleSecretChange}
              style={{ width: "440px" }}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="id"
              value={id ? id : ""}
              onChange={this.handleIdChange}
              style={{ width: "440px" }}
            />
          </div>
          <div>
            <select value={queryType} onChange={this.handleQueryTypeChange}>
              <option value={QueryType.SAVE}>save</option>
              <option value={QueryType.EDIT}>edit</option>
              <option value={QueryType.DELETE}>delete</option>
            </select>
          </div>
          <div>
            <textarea
              placeholder="anno json"
              rows={10}
              cols={60}
              onChange={this.handleAnnotationChange}
              value={annotation ? annotation : ""}
            />
          </div>
          <button
            onClick={e =>
              this.setState({
                queryTimestamp: String(new Date().getTime())
              })
            }
          >
            submit
          </button>
          {this.renderDebug()}
          <AnnoStoreQuery
            annotation={annotation}
            endpoint={endpoint}
            id={id}
            queryTimestamp={queryTimestamp}
            queryType={queryType}
            secret={secret}
            onQueryResult={(queryResult: string) => {
              this.setState({
                queryResult: queryResult
              });
            }}
          />
        </div>
      );
    } else {
      return <span>please supply an endpoint to query</span>;
    }
  }
}
