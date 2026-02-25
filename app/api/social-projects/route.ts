import { getDatabase } from '@/lib/mongodb';
import SocialProject, { ISocialProject } from '@/models/SocialProject';

import { NextRequest, NextResponse } from 'next/server';

import { FilterQuery, SortOrder } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await getDatabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const published = searchParams.get('published'); // 'true' or 'false'
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const filter: FilterQuery<ISocialProject> = {};

    if (published === 'true') {
      filter.isPublished = true;
    } else if (published === 'false') {
      filter.isPublished = false;
    }

    if (search) {
      filter.$or = [
        { 'title.ru': { $regex: search, $options: 'i' } },
        { 'title.kk': { $regex: search, $options: 'i' } },
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'description.ru': { $regex: search, $options: 'i' } },
        { 'description.kk': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = {
      publishedAt: sortOrder === 'asc' ? 1 : -1,
    };

    const [projects, total] = await Promise.all([
      SocialProject.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      SocialProject.countDocuments(filter),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
      },
    });
  } catch (error) {
    console.error('Failed to fetch social projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    const body = await request.json();

    // Basic validation
    if (
      !body.title?.ru ||
      !body.slug ||
      !body.beforeImage ||
      !body.afterImage
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await SocialProject.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    const project = new SocialProject(body);
    await project.save();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to create social project:', error);
    return NextResponse.json(
      { error: 'Failed to create social project' },
      { status: 500 }
    );
  }
}
