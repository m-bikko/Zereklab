import { getDatabase } from '@/lib/mongodb';
import Contact from '@/models/Contact';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    await getDatabase();
    console.log('✅ Database connected');

    // Try to count contacts
    const count = await Contact.countDocuments();
    console.log('📊 Total contacts in database:', count);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      contactCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('🧪 Testing contact creation...');
    await getDatabase();

    const testContact = new Contact({
      name: 'Test User',
      whatsapp: '+77753084648',
      subject: 'Test Subject',
      message: 'This is a test message',
      status: 'new',
    });

    const saved = await testContact.save();
    console.log('✅ Test contact created:', saved._id);

    // Clean up - delete the test contact
    await Contact.findByIdAndDelete(saved._id);
    console.log('🗑️ Test contact deleted');

    return NextResponse.json({
      success: true,
      message: 'Contact creation test successful',
      testId: saved._id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Contact creation test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
