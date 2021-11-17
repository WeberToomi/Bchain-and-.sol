import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json';
import NavBar from './NavBar';

//conectar la web a la bchain con metamask import web3


class App extends Component {
  // conectar la app a la bchain

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying Metamask')
    } 
  }
  
  async loadBlockchainData() {
    const web3 = window.web3
    //load account
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })
    ///Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = SocialNetwork.networks[networkId]
    if (networkData) {
      const socialNetwork = web3.eth.contract(SocialNetwork.abi, networkData.address)
      this.setState({ SocialNetwork })
      const postCount = await socialNetwork.methods.postCount().call()
      this.setState({ postCount})
      // Load Posts
      for (var i = 1; i <= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post]
        })
      }
    } else {
      window.alert('SocialNetwork contract not deployed to detected network')
    }
    ///Address
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      socialNetwork: null, 
      postCount: [0]
    }
  }


  render() {
    return (
      <div>
        <NavBar account= {this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style= {{ maxWidth: '500px' }}>
              <div className="content mr-auto ml-auto">
              { this.state.postCount.map((post, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <small className="text-muted">{post.author}</small>
                    </div>
                    <ul id="postList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p>Cuerpo del post</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <small className="float-left mt-1 text-muted">
                          TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH 
                        </small>
                        <button className="btn btn-link btn-sm float-right pt-0">
                          <span>
                            TIP 0.1 ETH 
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )
              })}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
