
import React, { Component, UseState } from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import {transferAsset} from '../common/ardorinterface';
import {validateAddress,validatePassPhrase,validateQuantity} from '../common/validators';
import {sendIgnis,transferCurrency, transferCurrencyZeroFee} from '../common/ardorinterface';
import {NQTDIVIDER,CURRENCY} from '../common/constants';
import {SignActionField} from '../common/signactionfield';
import {QrAccountField} from '../common/accountfield';
import { fetchCard } from '../common/common';
import { CardInfo, CardImage, CardInfoSlim } from '../common/cardinfo';
import { ThumbPlain } from '../carddeck/thumb';
import { Typography } from '@material-ui/core';
import {TxSuccess} from '../common/txsuccess';
import { round } from '../common/common';

import InputAdornment from '@material-ui/core/InputAdornment';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import ButtonGroup from 'react-bootstrap/ButtonGroup';







export function CraftForm(props){
  const ignisAvailableBalance = Math.min(props.wallet.balanceNQT,props.wallet.unconfirmedBalanceNQT)/NQTDIVIDER;
 
  return(

    <form onSubmit={(event)=>{event.preventDefault();props.handleSendCard()}}>
      <Grid container
        justify="center"
        alignItems="stretch"
        direction="column" 
        spacing={24} 
      >

        


        <Grid item>
          <Typography variant="h4">Crafting Cube </Typography>  
          <Typography variant="h6">&nbsp;</Typography>  
          <ThumbPlain card={props.card} index={props.index} width="80px"/>    
          <CardInfoSlim card={props.card}/>         
        </Grid>

        <Grid item>
        <ButtonGroup>
          <Button 
            variant="outline-light"
            size="sm"
            onClick={props.decrement}>
            -
          </Button>
          <TextField  
                  invalid={props.noCardsStatus.invalid}
                  inputProps={{min: 0, style: { textAlign: 'center' }}}
                  name="noCrafts"
                  label={"Craft card(s) (max: "+Math.floor((props.card.quantityQNT/5))+")"}
                  variant="outlined"
                  InputLabelProps={{
                    type:"number",
                    shrink: true
                  }}
                  value={props.noCrafts}
                  placeholder="No. cards to craft" />
              
          <Button 
            variant="outline-light"
            size="sm"
            onClick={props.increment}>
            +
          </Button>
        </ButtonGroup>
          </Grid>
               
        
        <Grid item>
          <TextField fullWidth 
                  invalid={props.noCardsStatus.invalid} 
                  margin="dense"
                  size="small"
                  name="noCards"
                  label={"Cards to sacrifice"}
                  variant="outlined"
                  InputLabelProps={{
                    type:"number",
                    shrink: true
                  }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: <InputAdornment position="end">{props.card.name}</InputAdornment>
                  }}
                  id="noCards" onChange={(event) => props.handleNoCardsChange(event)}
                  value={props.noCards*props.noCrafts}
                  error={props.noCardsStatus.error}
                  placeholder="No. cards to craft" />

          <Typography>{props.noCardsStatus.error}</Typography>
        </Grid>

        <Grid item>
              <TextField fullWidth
                  invalid={props.amountNQTStatus.invalid} 
                  margin="dense"
                  name="amountNQT"
                  label={"Crafting costs"}
                  variant="outlined"
                  InputLabelProps={{
                    type:"number",
                    shrink: true
                  }}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">IGNIS</InputAdornment>
                  }}
                  id="priceNQTPerShare" onChange={(event) => props.handleAmountChange(event)}
                  value={props.amountNQT*(props.noCrafts)}
                  error={props.amountNQTStatus.error}
                  placeholder="Enter amount to send" />
            <Typography>{props.amountNQTStatus.error}</Typography>
          </Grid>
        <Grid item>
          <SignActionField  {...props} 
                            action={props.handleSendCard}
                            />
        </Grid>      
      </Grid>
    </form>
  )
}




export class Crafting extends Component {
  constructor (props){
    console.log(props);
    super(props);
    this.state = {
      card: '{}',
      noCards:5,
      noCrafts:0,
      amountNQT:100,
      amountNQTStatus:{invalid:undefined,error:""},
      noCardsStatus:{invalid:false,error:''},
      passPhrase:"",
      passPhraseStatus:{invalid:undefined,error:''},
      receiverRS:"ARDOR-F4ED-RCXY-697N-GGV8S",
      receiverRsStatus:{invalid:undefined,error:''},
      message:"not yet implemented",
      displayQrReader:false
          };
  


    this.sendCard = this.sendCard.bind(this);
    this.sendCoin = this.sendCoin.bind(this);
    this.refresh = this.refresh.bind(this);

    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);


  }


  increment() {
    let max=this.state.card.quantityQNT;
    this.setState(prevState => {
      const noCrafts = prevState.noCrafts + 1 ? Math.floor((max/5)) : Math.floor((max/5))
      return {
        noCrafts
      };
    });
  }

  decrement() {
    this.setState(prevState => {
      const noCrafts = prevState.noCrafts > 0 ? prevState.noCrafts - 1 : 0

      return {
        noCrafts
      };
    });
  }

  refresh(){
    var self = this;
    fetchCard(this.props.nodeurl,this.props.user.accountRs,this.props.match.params.asset)
    .then((response)=>{
      self.setState({card:response});
    })
    .catch((err)=>{console.log(err)});
  }

  componentDidMount(){
    this.refresh();
    this.timer = setInterval(this.refresh,9000);
  }

  componentWillUnmount(){
    clearInterval(this.timer);
  }



  sendCard(event) {
    var self = this;
    console.log(self);
    let phraseValidated = validatePassPhrase(self.state.passPhrase,self.state.passPhraseStatus,self.props.user.accountRs);
    if  (phraseValidated.invalid){
      console.log("sendCard(): passphrase invalid, exiting.")
      self.setState({passPhraseStatus:phraseValidated},this.validateForm);
      return;
    }
    console.log("sendCard(): passphrase ok.")
    console.log('send '+self.state.noCards+' cards.');
    console.log('get publicKey');
    const message = JSON.stringify({contract:"TarascaDAOCardCraft"});
    transferAsset(self.props.nodeurl,self.state.card.asset,self.state.noCards,self.state.receiverRS,self.state.passPhrase,message)
    .then(function(response) {
      self.setState({response:response,responseTime:response.data.requestProcessingTime,bought:true,status:"success"});
    })
    .catch(function(error) {
      console.log(error);
    });
}


sendCoin(event) {
  var self = this;
  let phraseValidated = validatePassPhrase(self.state.passPhrase,self.state.passPhraseStatus,self.props.user.accountRs);
  if  (phraseValidated.invalid){
    console.log("sendCoin(): passphrase invalid, exiting.")
    self.setState({passPhraseStatus:phraseValidated},this.validateForm);
    return;
  }
  console.log('sendCoin(): passphrase OK, sendIgnis');
  let amountNQT = self.state.amountNQT*NQTDIVIDER;
  const message = JSON.stringify({contract:"TarascaDAOCardCraft"});
  
sendIgnis(this.props.nodeurl, amountNQT, self.state.receiverRS, this.state.passPhrase, message, true)
          .then(function(response){
            console.log(response);
            self.setState({response:response,responseTime:response.data.requestProcessingTime,bought:true,status:"success"});
          })
          .catch(function (error) {
              console.log('ohje sendIgnis (from buyPack Dialog):');
              console.log(error.message);
              self.setState({status:"ERROR"})
            });

  

}


  validateForm() {
    this.setState({formValid: (this.state.passPhraseStatus.invalid===false) && (this.state.noCardsStatus.invalid===false) && (this.state.receiverRsStatus.invalid===false)});
  }

  handlePassphraseChange(event){
    let value = event;
    this.setState(
      {passPhrase:value},
      ()=>{let fieldStatus = validatePassPhrase(value,this.state.passPhraseStatus);
            this.setState({passPhraseStatus:fieldStatus},this.validateForm);}
    );
  }

  handleNoCardsChange(event){
    let value = event.target.value;
    let max=this.state.card.quantityQNT;
    let min=5;
    this.setState(
      {noCards:value},
      ()=>{let fieldStatus = validateQuantity(value,max,min,this.state.noCardsStatus);
            this.setState({noCardsStatus:fieldStatus},this.validateForm);}
    );
  }

  // handlePassphraseChange(event){
  //     this.setState({passPhrase:event.target.value})
  // }

  handleReceiverRsChange(value){
      //let value = event.target.value;
      this.setState(
          {receiverRS:value},
          ()=>{let fieldStatus = validateAddress(value,this.state.receiverRsStatus);
              this.setState({receiverRsStatus:fieldStatus},this.validateForm);}
      );
  }


  handleAmountChange(event){
    let value = event.target.value;
    let max=Math.min(this.props.wallet.balanceNQT,this.props.wallet.unconfirmedBalanceNQT)/NQTDIVIDER;
    let min=100;
    this.setState(
      {amountNQT:value},
      ()=>{let fieldStatus = validateQuantity(value,max,min,this.state.amountNQTStatus);
            this.setState({amountNQTStatus:fieldStatus},this.validateForm);}
    );
  }


  toggler(props){
    this.setState({bought:false});
    this.props.toggle(!this.props.modalOpen);
  }

  render(){
    console.log(this.state);
    return(
      <div style={{textAlign:"center", padding:20, width:"90%", display:"inline-block"}}>
        
        <Grid container
          justify="center"
          alignItems="stretch"
          direction="row"
          spacing={24}
        >

          <Grid item className="boxed" style={{marginTop: 10, marginBottom:10, backgroundColor:'rgb(16 57 43)', border:'1px solid', borderColor:'#ffffff3b'}}>
          { this.state.bought ? (
              <TxSuccess/>
            ):(
              <CraftForm {...this.state}
                      {...this.props}
                      handleNoCardsChange={(event) => this.handleNoCardsChange(event)}
                      handleAmountChange={(event) => this.handleAmountChange(event)}
                      handlePassphraseChange={(event)=> this.handlePassphraseChange(event)}
                      handleReceiverRsChange={(event)=> this.handleReceiverRsChange(event)}
                      handleSendCard={()=>{this.sendCoin(); this.sendCard();}}
                      openQRCamera={this.openQRCamera}
                      handleToggle={this.toggler}
                      formValid={this.state.formValid}
                      increment={this.increment}
                      decrement={this.decrement}
                    />

            )
          }          
          </Grid>
        </Grid>

      </div>
    )
  }
}

