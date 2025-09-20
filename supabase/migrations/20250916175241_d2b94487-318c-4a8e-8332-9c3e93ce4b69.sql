-- CRITICAL SECURITY FIXES - Phase 1: Database Security

-- 1. Enable RLS on user_roles table (CRITICAL - prevents public access to admin user IDs)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all roles" 
ON public.user_roles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Enable RLS on feature_calculation_config (prevents public access to system config)
ALTER TABLE public.feature_calculation_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage feature config" 
ON public.feature_calculation_config 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Enable RLS on advanced_system_logs (prevents public access to system logs)
ALTER TABLE public.advanced_system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage system logs" 
ON public.advanced_system_logs 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Enable RLS on performance_metrics (prevents public access to performance data)
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage performance metrics" 
ON public.performance_metrics 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Fix security definer functions - set explicit search_path to prevent injection
CREATE OR REPLACE FUNCTION public.validate_comeback_inputs(p_team_name text, p_lookback_days integer, p_config jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_validation_result JSONB := '{"valid": true, "errors": []}'::JSONB;
    v_team_exists BOOLEAN := FALSE;
    v_similar_teams TEXT[];
BEGIN
    -- Validate team name
    IF p_team_name IS NULL OR LENGTH(TRIM(p_team_name)) = 0 THEN
        v_validation_result := jsonb_set(
            v_validation_result, 
            '{valid}', 
            'false'::JSONB
        );
        v_validation_result := jsonb_set(
            v_validation_result,
            '{errors}',
            (v_validation_result->'errors') || '["Team name cannot be null or empty"]'::JSONB
        );
    END IF;
    
    -- Validate lookback days
    IF p_lookback_days IS NULL OR p_lookback_days < 1 OR p_lookback_days > 3650 THEN
        v_validation_result := jsonb_set(
            v_validation_result, 
            '{valid}', 
            'false'::JSONB
        );
        v_validation_result := jsonb_set(
            v_validation_result,
            '{errors}',
            (v_validation_result->'errors') || '["Lookback days must be between 1 and 3650"]'::JSONB
        );
    END IF;
    
    -- Check team existence
    IF p_team_name IS NOT NULL AND LENGTH(TRIM(p_team_name)) > 0 THEN
        SELECT EXISTS(
            SELECT 1 FROM public.teams 
            WHERE LOWER(team_name) = LOWER(TRIM(p_team_name))
        ) INTO v_team_exists;
        
        IF NOT v_team_exists THEN
            -- Try to find similar teams
            BEGIN
                SELECT ARRAY_AGG(team_name ORDER BY team_name)
                INTO v_similar_teams
                FROM public.teams
                WHERE team_name ILIKE '%' || TRIM(p_team_name) || '%'
                LIMIT 3;
                
                v_validation_result := jsonb_set(
                    v_validation_result, 
                    '{valid}', 
                    'false'::JSONB
                );
                v_validation_result := jsonb_set(
                    v_validation_result,
                    '{errors}',
                    (v_validation_result->'errors') || 
                    format('["Team %s not found. Similar teams: %s"]', 
                           p_team_name, 
                           COALESCE(ARRAY_TO_STRING(v_similar_teams, ', '), 'none')
                    )::JSONB
                );
            EXCEPTION
                WHEN OTHERS THEN
                    v_validation_result := jsonb_set(
                        v_validation_result, 
                        '{valid}', 
                        'false'::JSONB
                    );
                    v_validation_result := jsonb_set(
                        v_validation_result,
                        '{errors}',
                        (v_validation_result->'errors') || 
                        format('["Team %s not found"]', p_team_name)::JSONB
                    );
            END;
        END IF;
    END IF;
    
    RETURN v_validation_result;
END;
$function$;

-- 6. Create profiles table for authentication (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update profiles updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();