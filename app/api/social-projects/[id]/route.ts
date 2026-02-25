import { getDatabase } from '@/lib/mongodb';
import SocialProject from '@/models/SocialProject';

import { NextRequest, NextResponse } from 'next/server';

import mongoose from 'mongoose';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await getDatabase();
    const { id } = params;

    let project;

    // Check if id is a valid ObjectId
    const isValidId = mongoose.Types.ObjectId.isValid(id);

    if (isValidId) {
      project = await SocialProject.findById(id);
    }

    // If not found by ID or ID is invalid, try finding by slug
    if (!project) {
      project = await SocialProject.findOne({ slug: id });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await getDatabase();
    const { id } = params;
    const body = await request.json();

    let project;
    const isValidId = mongoose.Types.ObjectId.isValid(id);

    if (isValidId) {
      project = await SocialProject.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });
    }

    if (!project) {
      project = await SocialProject.findOneAndUpdate({ slug: id }, body, {
        new: true,
        runValidators: true,
      });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await getDatabase();
    const { id } = params;

    let project;
    const isValidId = mongoose.Types.ObjectId.isValid(id);

    if (isValidId) {
      project = await SocialProject.findByIdAndDelete(id);
    }

    if (!project) {
      project = await SocialProject.findOneAndDelete({ slug: id });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
