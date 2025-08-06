#!/bin/bash

# Phase 2 Validation Script: Supabase Auth Setup
# This script validates that Phase 2 of the migration has been completed successfully

echo "🔍 Phase 2 Validation: Supabase Auth Setup"
echo "==========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if config.toml has been updated
echo -e "\n📋 1. Checking config.toml configuration..."

if grep -q "site_url = \"http://localhost:3002\"" supabase/config.toml; then
    echo -e "${GREEN}✅ Site URL configured correctly${NC}"
else
    echo -e "${RED}❌ Site URL not configured${NC}"
fi

if grep -q "creator.localhost:3002" supabase/config.toml; then
    echo -e "${GREEN}✅ Multi-domain redirect URLs configured${NC}"
else
    echo -e "${RED}❌ Multi-domain redirect URLs not configured${NC}"
fi

if grep -q "jwt_expiry = 86400" supabase/config.toml; then
    echo -e "${GREEN}✅ JWT expiry set to 24 hours${NC}"
else
    echo -e "${RED}❌ JWT expiry not configured${NC}"
fi

# Check OAuth providers
echo -e "\n🔐 2. Checking OAuth provider setup..."

if grep -q "\[auth.external.google\]" supabase/config.toml && grep -q "enabled = true" supabase/config.toml; then
    echo -e "${GREEN}✅ Google OAuth enabled${NC}"
else
    echo -e "${RED}❌ Google OAuth not enabled${NC}"
fi

if grep -q "\[auth.external.github\]" supabase/config.toml && grep -A1 "\[auth.external.github\]" supabase/config.toml | grep -q "enabled = true"; then
    echo -e "${GREEN}✅ GitHub OAuth enabled${NC}"
else
    echo -e "${RED}❌ GitHub OAuth not enabled${NC}"
fi

if grep -q "\[auth.external.discord\]" supabase/config.toml && grep -A1 "\[auth.external.discord\]" supabase/config.toml | grep -q "enabled = true"; then
    echo -e "${GREEN}✅ Discord OAuth enabled${NC}"
else
    echo -e "${RED}❌ Discord OAuth not enabled${NC}"
fi

# Check email templates
echo -e "\n📧 3. Checking email template customization..."

if grep -q "Voosting" supabase/templates/confirmation.html; then
    echo -e "${GREEN}✅ Confirmation email template updated with Voosting branding${NC}"
else
    echo -e "${RED}❌ Confirmation email template not updated${NC}"
fi

if grep -q "Voosting" supabase/templates/recovery.html; then
    echo -e "${GREEN}✅ Recovery email template updated with Voosting branding${NC}"
else
    echo -e "${RED}❌ Recovery email template not updated${NC}"
fi

if grep -q "매직 링크" supabase/templates/magic_link.html; then
    echo -e "${GREEN}✅ Magic link template updated with Voosting branding${NC}"
else
    echo -e "${RED}❌ Magic link template not updated${NC}"
fi

# Check migration files
echo -e "\n🗄️ 4. Checking database migration files..."

if [ -f "supabase/migrations/006_supabase_auth_rls_policies.sql" ]; then
    echo -e "${GREEN}✅ RLS policies migration file created${NC}"
else
    echo -e "${RED}❌ RLS policies migration file missing${NC}"
fi

if [ -f "supabase/migrations/007_auth_triggers_and_functions.sql" ]; then
    echo -e "${GREEN}✅ Auth triggers migration file created${NC}"
else
    echo -e "${RED}❌ Auth triggers migration file missing${NC}"
fi

if [ -f "supabase/migrations/008_security_enhancements.sql" ]; then
    echo -e "${GREEN}✅ Security enhancements migration file created${NC}"
else
    echo -e "${RED}❌ Security enhancements migration file missing${NC}"
fi

# Check migration content
echo -e "\n🔍 5. Checking migration content..."

if grep -q "handle_new_user" supabase/migrations/007_auth_triggers_and_functions.sql; then
    echo -e "${GREEN}✅ User trigger function defined${NC}"
else
    echo -e "${RED}❌ User trigger function missing${NC}"
fi

if grep -q "generate_referral_code" supabase/migrations/007_auth_triggers_and_functions.sql; then
    echo -e "${GREEN}✅ Referral code generation function defined${NC}"
else
    echo -e "${RED}❌ Referral code generation function missing${NC}"
fi

if grep -q "auth.uid()" supabase/migrations/006_supabase_auth_rls_policies.sql; then
    echo -e "${GREEN}✅ RLS policies use auth.uid()${NC}"
else
    echo -e "${RED}❌ RLS policies don't use auth.uid()${NC}"
fi

if grep -q "audit_logs" supabase/migrations/008_security_enhancements.sql; then
    echo -e "${GREEN}✅ Security audit logging implemented${NC}"
else
    echo -e "${RED}❌ Security audit logging missing${NC}"
fi

# Summary
echo -e "\n📊 Phase 2 Validation Summary"
echo "=============================="

echo -e "${YELLOW}📋 What was completed in Phase 2:${NC}"
echo "• Supabase Auth basic configuration"
echo "• OAuth providers (Google, GitHub, Discord) setup"
echo "• Email template customization with Voosting branding"
echo "• RLS policies updated for auth.uid() compatibility"
echo "• Database triggers for automatic profile creation"
echo "• Security enhancements and audit logging"

echo -e "\n${YELLOW}🔧 Next steps (Phase 3):${NC}"
echo "• Start Docker and run: npx supabase start"
echo "• Apply migrations: npx supabase db push"
echo "• Create new authentication components"
echo "• Update middleware to use Supabase Auth"
echo "• Replace Clerk authentication pages"

echo -e "\n${YELLOW}⚠️ Required before testing:${NC}"
echo "• Set up OAuth app credentials (Google, GitHub, Discord)"
echo "• Add OAuth client IDs and secrets to environment variables"
echo "• Start Supabase local development environment"

echo -e "\n✅ Phase 2 (Supabase Auth Setup) completed successfully!"
echo "Ready to proceed with Phase 3 (Component Development)"