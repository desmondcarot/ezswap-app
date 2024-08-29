import React, { Component } from 'react'
import './App.css'
import downArrow from "./downArrow.png"
import Web3 from 'web3'
import EZSwap from './abis/EZSwap.json'
import KFCToken from './abis/KFCToken.json'

window.ethereum.on('accountsChanged', async () => {
  window.location.reload(false);
});

class App extends Component {
  async componentWillMount(){
    await this.connect()
    await this.LoadBlockChainData()
  }

  //get data from blockchain ie account info
  async LoadBlockChainData(){
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})

    const balanceEth = await web3.eth.getBalance(this.state.account)
    this.setState({balanceEth})
    this.setState({intoken: balanceEth})

    //load kfctoken contract in javascript
    const networkId = await web3.eth.net.getId()
    console.log(networkId)
    const KFCtokenData = KFCToken.networks[networkId]
    if(KFCtokenData){
      const kfctoken = new web3.eth.Contract(KFCToken.abi, KFCtokenData.address)
      this.setState({kfctoken})

      let balanceKFCToken = await kfctoken.methods.balanceOf(this.state.account).call()
      this.setState({balanceKFCToken})
      this.setState({outtoken: balanceKFCToken})
    }else{
      window.alert("Contract not deployed to network")
    }

    //load ezswap contract in javascript
    const EZSwapData = EZSwap.networks[networkId]
    if(EZSwapData){
      const ezSwap = new web3.eth.Contract(EZSwap.abi, EZSwapData.address)
      this.setState({ezSwap})
      this.setState({ezSwapAdd:EZSwapData.address})
    }else{
      window.alert('Contract not deployed to network')
    }
    
    
  }

  //connect to blockchain via metamask
  async connect(){
     if (window.ethereum) {
       window.web3 = new Web3(window.ethereum)
       await window.ethereum.enable()
     }
     else if (window.web3){
       window.web3 = new Web3(window.web3.currentProvider)
     }else{
       window.alert('no metamask installed')
     }
  }

  buyTokens = (etherAmount) => {
    this.state.ezSwap.methods.ethToTokenSwap(etherAmount).send({value: etherAmount, from: this.state.account})
    let balanceKFCToken = this.state.kfctoken.methods.balanceOf(this.state.account).call()
    this.setState({balanceKFCToken})
  }

  buyEths = (tokenAmount) => {
    this.state.kfctoken.methods.approve(this.state.ezSwapAdd, tokenAmount).send({from: this.state.account}).on('transactionHash', (hash) => {
      this.state.ezSwap.methods.tokenToEthSwap(tokenAmount).send({from : this.state.account})
    })
  }

  //creating a state to store information from blockchain.
  constructor(props){
    super(props)
    this.state = {
      account: '',
      balanceEth: '0',
      kfctoken: {},
      balanceKFCToken: '0',
      ezSwap: {},
      intoken: '0',
      outtoken: '0',
      output: '0',
      outtokenType: 'KFC',
      intokenType: 'ETH',
      ezSwapAdd: ""
      }
  }
  
  //display webpage
  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top gradient-custom flex-md-nowrap p-2 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 ml-2 ps-2"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            EZSwap
          </a>
          <p className='navbar-brand col-sm-3 col-md-4'>ACC: {this.state.account}</p>
        </nav>
        <div className="container-fluid mt-5 pt-5">
          <div className="row">
            <div className="col-12 col-sm-8 col-md-6 m-auto">
              <div className="card border-1 shadow">
                <div className="card-body">
                  <form action="" onSubmit={(event) => {
                    event.preventDefault()
                    console.log('submit: ', this.state.outtokenType)
                    if (this.state.outtokenType == "ETH"){
                      let etherAmount = this.input.value.toString()
                      etherAmount = window.web3.utils.toWei(etherAmount, 'Ether')
                      this.buyEths(etherAmount)
                    }else if(this.state.outtokenType == "KFC"){
                      let tokenAmount = this.input.value.toString()
                      tokenAmount = window.web3.utils.toWei(tokenAmount, 'Ether')
                      this.buyTokens(tokenAmount)
                    }
                  }}>
                    <label className="float-left"><b>Please select exchange type and input your desired amount.</b></label><br/><br/>
                    <div><span className="float-end text-muted">Balance: {window.web3.utils.fromWei(this.state.intoken, 'Ether')} <b>{this.state.intokenType}</b></span></div><br/>
                    <div className="row">
                    <div className="col-md">
                        <div className="form-floating">
                          <select className="form-select" id="floatingSelectGrid" ref = {(input)=> this.menu = input} 
                          onChange={(event)=>{
                            console.log(this.menu.value)
                            if (this.menu.value == "ETH" ){
                              this.setState({intoken: this.state.balanceEth})
                              this.setState({outtoken: this.state.balanceKFCToken})
                              this.setState({intokenType: 'ETH'})
                              this.setState({outtokenType: 'KFC'})
                            }else if(this.menu.value == "KFC"){
                              this.setState({intoken: this.state.balanceKFCToken})
                              this.setState({outtoken: this.state.balanceEth})
                              this.setState({intokenType: 'KFC'})
                              this.setState({outtokenType: 'ETH'})
                            }
                            console.log('selection: ', this.state.exchangeType)
                          }
                          } 
                          aria-label="Floating label select example">
                            <option value="ETH">ETH -&gt; KFCToken</option>
                            <option value="KFC">KFCToken -&gt; ETH</option>
                          </select>
                          <label for="floatingSelectGrid">Select exchange type</label>
                        </div>
                      </div>
                      <div className="col-md">
                        <div className="form-floating">
                          <input type="text" className="form-control" id="floatingInputGrid" placeholder="1" onChange={(event =>{
                            const etherAmount = this.input.value.toString()
                            console.log("input: ", this.state.exchangeType)
                            let output
                            if (this.state.outtokenType == "KFC"){
                               //output = this.state.ezSwap.methods.getTokenAmount(etherAmount).call()
                               output = this.state.ezSwap.methods.getTokenAmount(window.web3.utils.toWei(etherAmount, 'Ether')).call()
                            }else if (this.state.outtokenType == "ETH"){
                               output = this.state.ezSwap.methods.getEthAmount(window.web3.utils.toWei(etherAmount, 'Ether')).call()
                            }
                            output.then((value) => { 
                              this.setState({
                                output:  (window.web3.utils.fromWei(value, 'Ether')) + " " + this.state.outtokenType
                              })
                            })
                            console.log(output)
                            console.log(this.state.output);
                          })} ref={(input) => {this.input = input}}/>
                          <label for="floatingInputGrid">Input Amount</label>
                        </div>
                      </div>        
                    </div>
                    <img src={downArrow} height='25' alt="" className="center-block"/>
                    <label className="float-left"><b>Output:</b></label>
                    <div><span className="float-end text-muted">Balance:{window.web3.utils.fromWei(this.state.outtoken, 'Ether')} <b>{this.state.outtokenType}</b></span></div>                        
                    <input type="text" name="" className="form-control my-4 py-2" placeholder="0" disabled value={(this.state.output)}></input>
                    <button className="w-100 mb-2 btn btn-lg rounded-4 btn-primary" type="submit">Swap</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
}

export default App;
