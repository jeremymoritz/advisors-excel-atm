import React, { useState } from 'react';
import { account } from '../Types/Account';
import Paper from '@mui/material/Paper/Paper';
import { Button, Card, CardContent, Grid, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

type AccountDashboardProps = {
  account: account;
  signOut: () => Promise<void>;
};

// Ideally these would exist and be enforced in the API and only supplementally
// provided to the frontend to improve the user experience
const MIN_WITHDRAWAL_AMOUNT = 5;
const MAX_WITHDRAWAL_AMOUNT = 200;

export const AccountDashboard = (props: AccountDashboardProps) => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [account, setAccount] = useState(props.account);

  const { signOut } = props;

  const depositFunds = async () => {
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: depositAmount })
    };
    const response = await fetch(
      `http://localhost:3000/transactions/${account.accountNumber}/deposit`,
      requestOptions
    );
    const data = await response.json();
    setAccount({
      accountNumber: data.account_number,
      name: data.name,
      amount: data.amount,
      type: data.type,
      creditLimit: data.credit_limit
    });
  };

  const putWithdrawalMutation = useMutation({
    mutationFn: async () => {
      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawAmount })
      };
      const response = await fetch(
        `http://localhost:3000/transactions/${account.accountNumber}/withdraw`,
        requestOptions
      );

      return response.json();
    },
    onSuccess: (data) => {
      setAccount({
        accountNumber: data.account_number,
        name: data.name,
        amount: data.amount,
        type: data.type,
        creditLimit: data.credit_limit
      });
    }
  });

  const withdrawFunds = async () => {
    // const requestOptions = {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({amount: withdrawAmount})
    // }
    // const response = await fetch(`http://localhost:3000/transactions/${account.accountNumber}/withdraw`, requestOptions);
    // const data = await response.json();
    const data = await putWithdrawalMutation.mutateAsync();

    if (!data) return;
  };

  return (
    <Paper className="account-dashboard">
      <div className="dashboard-header">
        <h1>Hello, {account.name}!</h1>
        <Button variant="contained" onClick={signOut}>
          Sign Out
        </Button>
      </div>
      <h2>Balance: ${account.amount}</h2>
      <Grid container spacing={2} padding={2}>
        <Grid item xs={6}>
          <Card className="deposit-card">
            <CardContent>
              <h3>Deposit</h3>
              <TextField
                label="Deposit Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: 'flex',
                  margin: 'auto'
                }}
                onChange={(e) => setDepositAmount(+e.target.value)}
              />
              <Button
                variant="contained"
                sx={{
                  display: 'flex',
                  margin: 'auto',
                  marginTop: 2
                }}
                onClick={depositFunds}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className="withdraw-card">
            <CardContent>
              <h3>Withdraw</h3>
              <TextField
                label="Withdraw Amount"
                variant="outlined"
                type="number"
                sx={{
                  display: 'flex',
                  margin: 'auto'
                }}
                onChange={(e) => setWithdrawAmount(+e.target.value)}
              />
              <Button
                variant="contained"
                sx={{
                  display: 'flex',
                  margin: 'auto',
                  marginTop: 2
                }}
                onClick={withdrawFunds}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
          {putWithdrawalMutation.isSuccess && (
            <h4 style={{ textAlign: 'center' }}>Successful Withdrawal!</h4>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};
