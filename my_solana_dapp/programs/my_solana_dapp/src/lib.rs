use anchor_lang::prelude::*;

declare_id!("89xQFfYcAGqoYHJZa93gSTZLxY5wSwxSf94cWeXVcbbj");

#[program]
pub mod my_solana_dapp {
    use super::*;

    pub fn create_greeting(ctx: Context<CreateGreeting>) -> Result<()> {
        let greeting_account = &mut ctx.accounts.greeting_account;
        greeting_account.counter = 0;
        Ok(())
    }

    pub fn increment_greeting(ctx: Context<IncrementGreeting>) -> Result<()> {
        let greeting_account = &mut ctx.accounts.greeting_account;
        greeting_account.counter += 1;
        Ok(())
    }
}

// Account for creating a greeting with PDA
#[derive(Accounts)]
pub struct CreateGreeting<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8, // discriminator + u64
        seeds = [b"greeting", user.key().as_ref()],
        bump
    )]
    pub greeting_account: Account<'info, GreetingAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// Account for incrementing the greeting counter
#[derive(Accounts)]
pub struct IncrementGreeting<'info> {
    #[account(
        mut,
        seeds = [b"greeting", user.key().as_ref()],
        bump
    )]
    pub greeting_account: Account<'info, GreetingAccount>,

    pub user: Signer<'info>,
}

// Struct for the greeting account
#[account]
pub struct GreetingAccount {
    pub counter: u64,
}

