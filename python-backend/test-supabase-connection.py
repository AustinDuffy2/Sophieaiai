#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from supabase import create_client, Client

def test_supabase_connection():
    print("🧪 Testing Supabase Connection...\n")
    load_dotenv()
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    print(f"📡 Supabase URL: {supabase_url[:30]}..." if supabase_url else "❌ NOT FOUND")
    print(f"🔑 Service Role Key: {supabase_key[:20]}..." if supabase_key else "❌ NOT FOUND")

    if not supabase_url or not supabase_key:
        print("\n❌ Missing Supabase credentials!")
        print("Please check your .env file and ensure you have:")
        print("  SUPABASE_URL=your-supabase-url")
        print("  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key")
        return False

    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("\n✅ Supabase client created successfully")
        
        # Test connection by trying to query the caption_tasks table
        result = supabase.table('caption_tasks').select('*').limit(1).execute()
        print(f"✅ Connection successful! Database query worked")
        return True
    except Exception as e:
        print(f"\n❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    success = test_supabase_connection()
    if success:
        print("\n🎉 Supabase connection test passed!")
    else:
        print("\n💡 Please fix the issues above and try again.")
