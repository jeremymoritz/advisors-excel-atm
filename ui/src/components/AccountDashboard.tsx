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
const MAX_DEPOSIT_AMOUNT = 1000;
const MIN_WITHDRAWAL_AMOUNT = 5;
const MAX_WITHDRAWAL_AMOUNT = 200;
const MAX_DAILY_WITHDRAWAL_TOTAL = 400;
const WITHDRAWAL_INCREMENT = 5; // must be able to be dispensed in $5 bills

const ARTIFICIAL_DELAY_TIME_IN_MILLIS = 800;

const getRequestOptions = (amount: number) => ({
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount })
});

const moneyfy = (amount?: number | null) =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: 'currency'
  }).format(amount || 0);

export const AccountDashboard = (props: AccountDashboardProps) => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [dailyWithdrawalTotal, setDailyWithdrawalTotal] = useState(0);
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
      // artificial delay to show pending state
      await new Promise((r) => setTimeout(r, ARTIFICIAL_DELAY_TIME_IN_MILLIS));

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
      // artificial delay to show pending state
      await new Promise((r) => setTimeout(r, ARTIFICIAL_DELAY_TIME_IN_MILLIS));

      const response = await fetch(
        `http://localhost:3000/transactions/${account.accountNumber}/withdraw`,
        getRequestOptions(withdrawAmount)
      );

      return response.json();
    },
    onSuccess: onSuccessfulMutation
  });

  const depositFunds = async () => {
    if (depositAmount > MAX_DEPOSIT_AMOUNT) {
      setDepositError(`Cannot deposit more than ${moneyfy(MAX_DEPOSIT_AMOUNT)} per transaction.`);

      return;
    }

    if (account.type === 'credit' && account.amount + depositAmount > 0) {
      setDepositError(
        `Cannot deposit more than what is required to zero out this account (${moneyfy(
          -account.amount
        )}).`
      );

      return;
    }

    setDepositError(null);
    putDepositMutation.mutate();
  };
  const withdrawFunds = () => {
    if (withdrawAmount > MAX_WITHDRAWAL_AMOUNT) {
      setWithdrawError(
        `Cannot withdraw more than ${moneyfy(MAX_WITHDRAWAL_AMOUNT)} per transaction.`
      );

      return;
    }

    if (withdrawAmount < MIN_WITHDRAWAL_AMOUNT) {
      setWithdrawError(`Cannot withdraw less than ${moneyfy(MIN_WITHDRAWAL_AMOUNT)}.`);

      return;
    }

    // dispensable in $5 bills
    if (withdrawAmount % WITHDRAWAL_INCREMENT) {
      setWithdrawError(
        `Withdrawal amount must be able to be dispensed in ${moneyfy(WITHDRAWAL_INCREMENT)} bills.`
      );

      return;
    }

    if (account.type === 'credit') {
      // each credit account has a negative amount and positive credit limit
      if (withdrawAmount - account.amount > (account.creditLimit || 0)) {
        setWithdrawError(
          `You cannot withdraw beyond your credit limit (${moneyfy(account.creditLimit)}).`
        );

        return;
      }
    } else if (withdrawAmount > account.amount) {
      // not a credit account
      setWithdrawError(
        `You cannot withdraw more than your full balance (${moneyfy(account.amount)}).`
      );

      return;
    }

    const dailyTotalAfterWithdrawal = dailyWithdrawalTotal + withdrawAmount;

    if (dailyTotalAfterWithdrawal > MAX_DAILY_WITHDRAWAL_TOTAL) {
      setWithdrawError(
        `This withdrawal would bring your daily total to ${moneyfy(
          dailyTotalAfterWithdrawal
        )}, which exceeds the daily maximum withdrawal amount of ${moneyfy(
          MAX_DAILY_WITHDRAWAL_TOTAL
        )}.`
      );

      return;
    }

    setWithdrawError(null);
    setDailyWithdrawalTotal(dailyWithdrawalTotal + withdrawAmount);
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
      <h2>Balance: {moneyfy(account.amount)}</h2>
      <Grid container spacing={2} padding={2}>
        <Grid item xs={6}>
          <Card className="deposit-card">
            <CardContent>
              <h3>Deposit</h3>
              <TextField
                {...(depositError && { color: 'error' })}
                error={!!depositError}
                label="Deposit Amount"
                helperText={depositError ? `ERROR: ${depositError}` : null}
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
          {putDepositMutation.isPending && <h4 style={{ textAlign: 'center' }}>Processing...</h4>}
          {putDepositMutation.isSuccess && !depositError && (
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
                helperText={withdrawError ? `ERROR: ${withdrawError}` : null}
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
          {putWithdrawalMutation.isPending && (
            <h4 style={{ textAlign: 'center' }}>Processing...</h4>
          )}
          {putWithdrawalMutation.isSuccess && !withdrawError && (
            <h4 style={{ textAlign: 'center', color: 'green' }}>Successful Withdrawal!</h4>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};
