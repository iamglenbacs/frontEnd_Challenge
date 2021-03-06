import React, { Component } 
  from 'react';
import { createPaginationContainer, graphql } 
  from 'react-relay';
import { ConnectionHandler } 
  from 'relay-runtime';
import Input from 'antd/lib/input';  // for js
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Menu from 'antd/lib/menu';
import Icon from 'antd/lib/icon';
import { Tab, Card } from 'semantic-ui-react'
import Todo from './Todo';
import AddTodoMutation from '../mutations/AddTodoMutation';

class TodoListProfile extends Component {

  state = {
    text: ''
  }

  _renderTodos() {
    if(this.props.viewer.allTodosByUser.edges.length === 0) {
      return "Ain't got nothing to do yet?"
    }
    return this.props.viewer.allTodosByUser.edges.map((edge) => {// TodoListProfile is declared on the TodoListProfile(its' parent) and it has been passed viewer props there.
        return (
          <Todo // below are props we pass on Todo component
            key={edge.node.id}
            todo={edge.node}
            viewer={this.props.viewer}
          />
        )
      }
    )
  }

  _confirm = () => {
    const { text, privacy } = this.state;
    AddTodoMutation.commit(
      this.props.relay.environment,
      text,
      privacy,
      this.props.viewer,
    );
    this.setState({text: ''});
  }

  _loadMore = () => {
    if(!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return;
    } 
    this.props.relay.loadMore(4)
  }

  render() {
const menu = (
      <Menu onClick={({key}) => this.setState({ privacy: key })}>
        <Menu.Item key="public"  > Publiic </Menu.Item>
        <Menu.Item key="friends" > Friends </Menu.Item>
        <Menu.Item key="onlyMe"  > Only Me </Menu.Item>
      </Menu>
    );

    const showPrivacy = (privacy) => {
      if(privacy === 'public') {
        return 'Public';
      } else if(privacy === 'friends') {
        return 'Friends';
      } else if(privacy === 'onlyMe') {
        return 'Only Me';
      }
    }
      
    const panes = [
      { menuItem: 'Todos', render: () => {
        return (<Tab.Pane style={{marginLeft: 'auto', marginRight: 'auto', width: '100%', height: '100%',textAlign: 'center'}}>
                <section className="createTodo-box">
                <span style={{ fontSize: '20px', marginTop:'6px'}}> Load More Pagination </span>
                                     <div style={{marginTop:'12px'}} className="createTodo-inside">
                                       <Input
                                         value={this.state.text}
                                         style={{ width: '200px' }}
                                         onChange={(e) => this.setState({ text: e.target.value })}
                                         type='text'
                                         placeholder='What needs to be done?'
                                       />
                                       <Button className="createTodo-button" style={{marginLeft: '5px'}} onClick={() => this._confirm()} type="primary"> Create </Button>
                                   </div> 
                                 </section>
                <div style={{marginLeft: 'auto', marginRight: 'auto', width: '100%', height: '100%',textAlign: 'center'}}>
                
                <ul style={{listStyle: 'none',marginLeft: 'auto', marginRight: 'auto', textAlign: 'left',width:'25%'}}>     
                  {this._renderTodos()}
                </ul> 
                <Button style={{width: '150px', height:'40px', marginTop:'12px'}} type="primary" onClick={()=>this._loadMore()}> Load More </Button></div>
                </Tab.Pane>)
      } },
      { menuItem: 'About the developer', render: () => <Tab.Pane>Can't think of anything else. I enjoy javascript and planting/farming. I am from Philippines. Mabuhay! I'll add more info here soon since I am not a criminal anyway, my email is gpbaculio@gmail.com ^____^ </Tab.Pane> },
    ];


    return (
      <div>
        <span style={{position: 'relative', top:'30px', bottom:'30px', width: 'auto', marginRight:'30px', marginLeft:'30px', fontSize:'27px', marginTop:'30px',marginBottom:'30px'}} > {`${this.props.viewer.fullName}`} </span>
        <Tab style={{position:'relative', top:'30px', marginTop:'30px', width: 'auto', marginRight:'30px', marginLeft:'30px'}} panes={panes} />     
      </div>
    )
  }

}

export default createPaginationContainer(
  TodoListProfile, 
     graphql`# not sure, but i believe the queries below is to make sure that the data is available before THIS component renders?
  fragment TodoListProfile_viewer on User { # User is a name of a GraphQL type on ../data/schema.js
    allTodosByUser( first: $count after: $cursor ) @connection(key: "TodoListProfile_allTodosByUser") { #this is a relay connection
      edges {
        node {
          ...Todo_todo # the data dependency of Todo component
          id
          text 
          complete 
          privacy
          fullName
        }
      }
      pageInfo { # for pagination
                hasPreviousPage
                startCursor 
                hasNextPage
                endCursor 
              }
    }
    id
    fullName
    ...Todo_viewer
  }
`,
  {
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.allTodosByUser;
    },
    getFragmentVariables(prevVars, totalCount) { // variables for the fragment. prevVars = is a default object of variables/arguments: e.g. $count, $cursor || totalCount/total rendered nodes
      // this defines the variables passed to the first query.
      return {
        ...prevVars,
         count: totalCount
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      // this defines the variables passed to the refetched 'second query'.
      return {
        count,
        cursor,
      };
    },
    query: graphql`
      query TodoListProfileQuery(
        $count: Int! $cursor:String
      ) {
        viewer { #on mongoose query specify how many u need to return, maybe start with 10?
          # You could reference the fragment defined previously.
          ...TodoListProfile_viewer
        }
      }
    `
  })
