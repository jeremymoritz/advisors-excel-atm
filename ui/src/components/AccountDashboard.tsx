import React, { useState } from 'react';
import { Account, TransactionResponse } from '../Types/types';
import Paper from '@mui/material/Paper/Paper';
import { Button, Card, CardContent, Grid, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

type AccountDashboardProps = {
  account: Account;
  signOut: () => Promise<void>;
};

// Ideally these would exist and be enforced in the API and only supplementally
// provided to the frontend to improve the user experience
const MIN_WITHDRAWAL_AMOUNT = 5;
const MAX_WITHDRAWAL_AMOUNT = 200;

const getRequestOptions = (amount: number) => ({
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount })
});

export const AccountDashboard = (props: AccountDashboardProps) => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [account, setAccount] = useState(props.account);
  const { signOut } = props;

  const onSuccessfulMutation = (data: TransactionResponse) => {
    setAccount({
      ...data,
      accountNumber: data.account_number,
      creditLimit: data.credit_limit
    });
  };
  const putDepositMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `http://localhost:3000/transactions/${account.accountNumber}/deposit`,
        getRequestOptions(depositAmount)
      );

      return response.json();
    },
    onSuccess: onSuccessfulMutation
  });
  const putWithdrawalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `http://localhost:3000/transactions/${account.accountNumber}/withdraw`,
        getRequestOptions(withdrawAmount)
      );

      return response.json();
    },
    onSuccess: onSuccessfulMutation
  });

  const depositFunds = async () => {
    putDepositMutation.mutate();
  };
  const withdrawFunds = () => {
    if (withdrawAmount > MAX_WITHDRAWAL_AMOUNT) {
      setWithdrawError(`Cannot withdraw more than $${MAX_WITHDRAWAL_AMOUNT} per transaction.`);

      return;
    }

    if (withdrawAmount < MIN_WITHDRAWAL_AMOUNT) {
      setWithdrawError(`Cannot withdraw less than $${MIN_WITHDRAWAL_AMOUNT}.`);

      return;
    }

    setWithdrawError(null);
    putWithdrawalMutation.mutate();
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
          {putDepositMutation.isPending && <h4 style={{ textAlign: 'center' }}>Pending...</h4>}
          {putDepositMutation.isSuccess && (
            <h4 style={{ textAlign: 'center', color: 'green' }}>Successful Deposit!</h4>
          )}
        </Grid>
        <Grid item xs={6}>
          <Card className="withdraw-card">
            <CardContent>
              <h3>Withdraw</h3>
              <TextField
                {...(withdrawError && { color: 'error' })}
                error={!!withdrawError}
                label="Withdraw Amount"
                helperText={withdrawError || null}
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
          {putWithdrawalMutation.isPending && <h4 style={{ textAlign: 'center' }}>Pending...</h4>}
          {putWithdrawalMutation.isSuccess && (
            <h4 style={{ textAlign: 'center', color: 'green' }}>Successful Withdrawal!</h4>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};
